import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

@Controller('statistic')
export class StatisticController {
  constructor(
    private readonly statisticService: StatisticService,
  ) {};

  // Todo: getUser 타입 작성, 통계 데이터 반환

  @Get()
  @UseGuards(JwtAccessGuard)
  getStatistic(@GetUser() user: any) {
    return this.statisticService.getStatistic(user);
  }
}
