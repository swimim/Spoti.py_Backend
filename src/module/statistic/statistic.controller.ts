import { Controller, Get, MessageEvent, Param, Sse, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Observable } from 'rxjs';

@Controller('statistic')
export class StatisticController {
  constructor(
    private readonly statisticService: StatisticService,
  ) { };

  @Sse('notification')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAccessGuard)
  public getWarningNotification(
    @GetUser() user: any
  ): Observable<MessageEvent> {
    const userIdx = user.userIdx;

    return this.statisticService.getWarningNotification(userIdx);
  }

  @Get(':method')
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAccessGuard)
  async getDrowsnessWarnings(@GetUser() user: any, @Param("method") method: string) {
    return this.statisticService.getStatistic(user, method);
  }
}
