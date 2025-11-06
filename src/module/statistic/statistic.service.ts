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
  ) { }

  async setStatistic(dto: fetchDrownessRequestDTO[], user: any) {
    const _user = await this.userRepository.findOne({
      where: { idx: user.user_idx },
    });

    if (!_user) throw new NotFoundException('사용자를 찾지 못했습니다.');

    const emailPrefix = `email:${_user.email}:`;
    let closedCount = 0;
    let yawningCount = 0;
    let avgEarSmooth = 0;

    // 상태 분류 및 평균 계산
    dto.forEach((log) => {
      if (log.status === EyeStatusENUM.CLOSE) {
        closedCount++;
      } else if (log.status === EyeStatusENUM.YAWNING) {
        yawningCount++;
      } else {
        avgEarSmooth += log.ear_smooth;
      }
    });

    const normalCount = dto.length - closedCount - yawningCount;
    avgEarSmooth = normalCount > 0 ? avgEarSmooth / normalCount : 0;
    const totalAbnormalCount = closedCount + yawningCount;

    if (totalAbnormalCount >= 4) {
      log(`${_user.lastName} Is Sleeping!!!`, 500, 'INFO');
    }

    // 통계 업데이트 (누적 평균 계산)
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
      yellingStatus: totalAbnormalCount >= 4,
      user: _user,
    });
    await this.drowsinessRepository.save(drowsinessRecord);

    // 캐시 처리
    const cacheData = {
      earSmooth: avgEarSmooth,
      yellingStatus: totalAbnormalCount >= 4,
      timestamp: new Date().toISOString(),
      statusCount: { closed: closedCount, yawning: yawningCount, normal: normalCount },
    };

    const hasClosed = closedCount > 0;
    const hasYawning = yawningCount > 0;

    if (hasClosed || hasYawning) {
      const ttl = hasClosed ? 1800 : 3600;
      const keys = await (this.cacheManager.stores as any).keys(`${emailPrefix}*`);

      // 기존 캐시 TTL 갱신
      for (const key of keys) {
        const value = await this.cacheManager.get(key);
        if (value) {
          await this.cacheManager.set(key, value, ttl);
        }
      }

      // 새 캐시 추가
      const nextIdx = keys.length + 1;
      await this.cacheManager.set(`${emailPrefix}${nextIdx}`, cacheData, ttl);
    }

    return { message: '통계 및 캐시 업데이트 완료' };
  }
}