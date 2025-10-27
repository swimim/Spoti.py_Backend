import { Controller, Get } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { GetUser } from 'src/common/decorators/getUser.decorator';

@Controller('statistic')
export class StatisticController {
  constructor(
    private readonly statisticService: StatisticService,
  ) {};

  // Todo: getUser 타입 작성
  @Get()
  getStatistic(@GetUser() user: any) {
    return this.statisticService.getStatistic(user);
  }
}
