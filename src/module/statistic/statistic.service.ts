import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { fetchDrownessRequestDTO } from './dtos/fetchDrownessRequest.dto';
import { Repository, Between } from 'typeorm';
import { Drowsiness } from './entities/drowsiness.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { DrowsinessStat } from './entities/drowsiness_stat.entity';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { EyeStatusENUM } from './enums/eye-status.enum';
import log from 'spectra-log';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(Drowsiness)
    private readonly drowsinessRepository: Repository<Drowsiness>,
    @InjectRepository(DrowsinessStat)
    private readonly drowsinessStatRepository: Repository<DrowsinessStat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) { }

  async getStatistic(user: any, method = "weekly") {
    const _user = await this.userRepository.findOne({
      where: { idx: user.user_idx },
    });

    if (!_user) throw new NotFoundException('사용자를 찾지 못했습니다.');

    const generateData = async () => {
      const now = new Date();

      switch (method) {
        case "weekly": {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);

          const records = await this.drowsinessRepository.find({
            where: {
              user: { idx: _user.idx },
              at: Between(weekAgo, now),
            },
            order: { at: 'ASC' },
          });

          const weeklyData = new Map<string, number>();

          for (let i = 0; i <= 6; i++) {
            weeklyData.set(i.toString(), 0);
          }

          // 기존 데이터 카운트
          records.forEach((record) => {
            const dayIndex = record.at.getDay().toString();
            weeklyData.set(dayIndex, (weeklyData.get(dayIndex) || 0) + 1);
          });

          return Array.from(weeklyData.entries()).map(([day, count]) => ({
            day,
            drowsinessCount: count,
            option: [],
          }));
        }

        case "monthly":
        default: {
          // 최근 30일간 데이터
          const monthAgo = new Date(now);
          monthAgo.setDate(now.getDate() - 30);

          const records = await this.drowsinessRepository.find({
            where: {
              user: { idx: _user.idx },
              at: Between(monthAgo, now),
            },
            order: { at: 'ASC' },
          });

          // 날짜별로 그룹화 (MM-DD)
          const dailyData = new Map<string, number>();

          for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${month}-${day}`;
            dailyData.set(formattedDate, 0);
          }

          // 실제 데이터 카운트
          records.forEach((record) => {
            const month = String(record.at.getMonth() + 1).padStart(2, '0');
            const day = String(record.at.getDate()).padStart(2, '0');
            const formattedDate = `${month}-${day}`;
            dailyData.set(formattedDate, (dailyData.get(formattedDate) || 0) + 1);
          });

          const result = Array.from(dailyData.entries()).map(([date, count]) => ({
            date,
            drowsinessCount: count,
            option: [] as string[],
          }));

          const top = result
            .sort((a, b) => b.drowsinessCount - a.drowsinessCount)
            .slice(0, 9);

          const maxDrowsiness = Math.max(...top.map(item => item.drowsinessCount));

          top.forEach(item => {
            if (item.drowsinessCount === maxDrowsiness && maxDrowsiness > 0) {
              item.option = ["highest"];
            }
          });

          // 날짜 내림차순 정렬
          return top.sort((a, b) => b.date.localeCompare(a.date));
        }
      }
    };

    return {
      success: true,
      data: await generateData(),
    };
  }

  async setStatistic(dto: fetchDrownessRequestDTO[], user: any) {
    const _user = await this.userRepository.findOne({
      where: { idx: user.user_idx },
    });

    if (!_user) throw new NotFoundException('사용자를 찾지 못했습니다.');

    const emailPrefix = `drowsiness:${_user.email}`;
    const DETECTION_WINDOW = this.configService.get<number>("DETECTION_WINDOW") ?? 300; // 5분
    const ALERT_THRESHOLD = this.configService.get<number>("ALERT_THRESHOLD") ?? 4; // 4회
    const CACHE_TTL = DETECTION_WINDOW * 1000;

    let closedCount = 0;
    let yawningCount = 0;
    let avgEarSmooth = 0;

    dto.forEach((varLog) => {
      if (varLog.status == EyeStatusENUM.CLOSED) closedCount++;
      else if (varLog.status == EyeStatusENUM.YAWNING) yawningCount++;
      else avgEarSmooth += varLog.ear_smooth;
    });

    const normalCount = dto.length - closedCount - yawningCount;
    avgEarSmooth = normalCount > 0 ? avgEarSmooth / normalCount : 0;
    const currentAbnormalCount = closedCount + yawningCount;

    let prevValue = await this.drowsinessStatRepository.findOne({
      where: { user: { idx: _user.idx } },
    });

    if (!prevValue) {
      const stat = this.drowsinessStatRepository.create({
        user: _user,
        averageEarSmooth: avgEarSmooth,
      });
      await this.drowsinessStatRepository.save(stat);
    } else {
      prevValue.averageEarSmooth = avgEarSmooth;
      await this.drowsinessStatRepository.save(prevValue);
    }

    const drowsinessRecord = this.drowsinessRepository.create({
      earSmooth: avgEarSmooth,
      tiredStatus: false,
      user: _user,
    });
    await this.drowsinessRepository.save(drowsinessRecord);

    if (currentAbnormalCount > 0) {
      const cachedHistory: any[] = (await this.cacheManager.get(emailPrefix)) || [];
      const now = Date.now();

      const recentHistory = cachedHistory.filter(
        (record) => now - record.timestamp < CACHE_TTL
      );

      recentHistory.push({
        timestamp: now,
        closed: closedCount,
        yawning: yawningCount,
        earSmooth: avgEarSmooth,
      });

      const totalDetections = recentHistory.reduce(
        (sum, record) => sum + record.closed + record.yawning,
        0
      );

      // 알림 전송 로직
      if (totalDetections >= ALERT_THRESHOLD) {
        log(`${_user.email} - 5분간 졸음 징후 ${totalDetections}회 감지\n== DETAILS ==================\n${recentHistory.map((r, index) => `[${index}] Eye Closed: ${r.closed}, Yawning: ${r.yawning}, Detected: ${(Date.now() - r.timestamp) / 1000} seconds ago`).join('\n')}`);

        drowsinessRecord.tiredStatus = true;
        await this.drowsinessRepository.save(drowsinessRecord);
      }

      await this.cacheManager.set(emailPrefix, recentHistory, CACHE_TTL);
    }

    return {
      message: '통계 및 캐시 업데이트 완료',
      totalDetections: currentAbnormalCount,
    };
  }
}