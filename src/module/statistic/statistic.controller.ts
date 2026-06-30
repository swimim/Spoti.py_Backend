import { Controller, Get, Param, Sse, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('statistic')
export class StatisticController {
  constructor(
    private readonly statisticService: StatisticService,
  ) { };

  @Sse('notification')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAccessGuard)
  public async getWarningNotification(
    @GetUser() user: any
  ) {
    const userIdx = user.userIdx;

    return await this.statisticService.subscribeNotification(userIdx);
  }

  @Get(':method')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAccessGuard)
  async getDrowsnessWarnings(@GetUser() user: any, @Param("method") method: string) {
    return this.statisticService.getStatistic(user, method);
  }
}