import { Injectable, NotFoundException } from '@nestjs/common';
import { fetchDrownessRequestDTO } from './dtos/fetchDrownessRequest.dto';
import { Repository } from 'typeorm';
import { Drowsiness } from './entities/drowsiness.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { DrowsinessStat } from './entities/drowsiness_stat.entity';
import log from 'spectra-log';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(Drowsiness)
    private readonly drowsinessRepository: Repository<Drowsiness>,

    @InjectRepository(DrowsinessStat)
    private readonly drowsinessStatRepository: Repository<DrowsinessStat>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { };

  getStatistic(user: any) {
    console.log(user);
  }

  async setStatistic(dto: fetchDrownessRequestDTO[], user: any) {
    const _user = await this.userRepository.findOne({
      where: {
        idx: user.user_idx
      }
    })

    if (!_user) throw new NotFoundException("사용자를 찾지 못했습니다.");

    let count = 0;
    let avgEarSmooth = 0;

    dto.map(log => log.status.match("CLOSED") || log.status.match("YELLING") ? count++ : avgEarSmooth += log.ear_smooth);

    if (count >= 4) {
      log(`${_user.lastName} Is Sleeping!!!`, 500, 'INFO')
    }

    avgEarSmooth = avgEarSmooth / (dto.length - count);

    let prevValue = await this.drowsinessStatRepository.findOne({ where: { user: _user } })

    if (!prevValue) {
      const stat = this.drowsinessStatRepository.create({
        user: _user,
        averageEarSmooth: avgEarSmooth
      });
      await this.drowsinessStatRepository.save(stat);
      const drowsinessRecord = await this.drowsinessRepository.create({
        earSmooth: avgEarSmooth,
        yellingStatus: count >= 4 ? true : false,
        user: _user
      });
      await this.drowsinessRepository.save(drowsinessRecord);
    }

    if (prevValue) {
      const newEarSmooth = (prevValue.averageEarSmooth + avgEarSmooth) / 2;
      prevValue.averageEarSmooth = newEarSmooth;

      await this.drowsinessStatRepository.save(prevValue);
      const drowsinessRecord = await this.drowsinessRepository.create({
        earSmooth: avgEarSmooth,
        yellingStatus: count >= 4 ? true : false,
        user: _user
      });
      await this.drowsinessRepository.save(drowsinessRecord);
    }

    return;
  }
}
