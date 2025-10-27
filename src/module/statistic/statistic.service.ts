import { Injectable, NotFoundException } from '@nestjs/common';
import { fetchDrownessRequestDTO } from './dtos/fetchDrownessRequest.dto';
import { Repository } from 'typeorm';
import { Drowsiness } from './entities/drowsiness.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class StatisticService {
  constructor (
    @InjectRepository(Drowsiness)
    private readonly drowsinessRepository: Repository<Drowsiness>,

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

    const drowsiness = dto.map(log => {
      const drownessLog = new Drowsiness();
      drownessLog.user = _user;
      drownessLog.earSmooth = log.ear_smooth;
      drownessLog.status = log.status;
      drownessLog.at = log.timestamp;
      return drownessLog;
    })

    await this.drowsinessRepository.save(drowsiness);

    // const value = dto.map(statistic => {
    //   return `(${_user}, '${statistic.timestamp}', '${statistic.ear_smooth}', '${statistic.status}')`
    // }).join(", ");

    // const SQL = `INSERT INTO drowsiness (user_idx, at, ear_smooth, status) VALUES ${value};`;

    // this.drowsinessRepository.query(SQL);
    
    return;
  }
}
