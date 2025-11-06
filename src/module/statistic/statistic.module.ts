import { Module } from '@nestjs/common';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';
import { StatisticInternalController } from './statistic.internal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drowsiness } from './entities/drowsiness.entity';
import { User } from '../user/entities/user.entity';
import { DrowsinessStat } from './entities/drowsiness_stat.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([Drowsiness, User, DrowsinessStat]),
    CacheModule.register({
      ttl: 3600,  
      max: 100,
      isCacheableValue: (value) => value !== undefined && value !== null,
    }),
  ],
  controllers: [StatisticController, StatisticInternalController],
  providers: [StatisticService]
})
export class StatisticModule { }
