import { Module } from '@nestjs/common';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';
import { StatisticInternalController } from './statistic.internal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drowsiness } from './entities/drowsiness.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Drowsiness, User]),
  ],
  controllers: [StatisticController, StatisticInternalController],
  providers: [StatisticService]
})
export class StatisticModule {}
