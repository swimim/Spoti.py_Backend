import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import log from 'spectra-log';

@Controller('statistic')
export class StatisticController {
  constructor(
    private readonly statisticService: StatisticService,
  ) { };

  @Get('notification')
  @UseGuards(JwtAccessGuard)
  async getWarningNotification(@GetUser() user: any) {
    return this.statisticService.getWarningNotification(user);
  }

  @Get(':method')
  @UseGuards(JwtAccessGuard)
  async getDrowsnessWarnings(@GetUser() user: any, @Param("method") method: string) {
    return this.statisticService.getStatistic(user, method);
  }
}