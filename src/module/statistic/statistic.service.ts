import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { fetchDrownessRequestDTO } from './dtos/fetchDrownessRequest.dto';
import { Repository } from 'typeorm';
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

  async getStatistic(user: any, method: string = "weekly") {
    const generateData = () => {
      switch (method) {
        case "weekly":
          return Array.from({ length: 7 }, (_, i) => ({
            day: i.toString(),
            drowsinessCount: Math.round(Math.random() * 20),
            option: [],
          }));
        case "monthly":
        default:
          const now = new Date();
          const result: any[] = [];

          for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${month}-${day}`;

            result.push({
              date: formattedDate,
              drowsinessCount: Math.round(Math.random() * 20),
              option: [],
            });
          }

          const top = result
            .sort((a, b) => b.drowsinessCount - a.drowsinessCount)
            .slice(0, 9);

          const maxDrowsiness = Math.max(...top.map(item => item.drowsinessCount));

          top.forEach(item => {
            if (item.drowsinessCount === maxDrowsiness) {
              item.option = ["highest"];
            }
          });

          return top.sort((b, a) => a.date.localeCompare(b.date));
      }
    };

    return {
      success: true,
      data: generateData(),
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

    // 상태 분류 및 평균 계산
    dto.forEach((varLog) => {
      if (varLog.status == EyeStatusENUM.CLOSED) closedCount++;
      else if (varLog.status == EyeStatusENUM.YAWNING) yawningCount++;
      else avgEarSmooth += varLog.ear_smooth;
    });

    const normalCount = dto.length - closedCount - yawningCount;
    avgEarSmooth = normalCount > 0 ? avgEarSmooth / normalCount : 0;
    const currentAbnormalCount = closedCount + yawningCount;

    // DB 통계 업데이트
    let prevValue = await this.drowsinessStatRepository.findOne({
      where: { user: _user },
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

      // 알림 전송 로직으로 대체
      if (totalDetections >= ALERT_THRESHOLD) {
        log(`${_user.email} - 5분간 졸음 징후 ${totalDetections}회 감지\n== DETAILS ==================\n${recentHistory.map((r, index) => `[${index}] Eye Closed: ${r.closed}, Yelling: ${r.yawning}, Detected: ${(Date.now() - r.timestamp) / 1000} seconds ago`).join('\n')}`);

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