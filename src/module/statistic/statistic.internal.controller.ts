import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { fetchDrownessRequestDTO } from './dtos/fetchDrownessRequest.dto';
import { InternalGuard } from './guards/internal.guard';
import { StatisticService } from './statistic.service';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

@Controller('internal/statistic')
export class StatisticInternalController {
  constructor(
    private readonly statisticService: StatisticService
  ) { };
  
  @UseGuards(InternalGuard)
  @UseGuards(JwtAccessGuard)
  @Post()
  async fetchStatistic(@Body() dto: fetchDrownessRequestDTO[], @GetUser() user: any) {
    return this.statisticService.setStatistic(dto, user);
  }
}
