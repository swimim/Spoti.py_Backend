import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { fetchDrownessRequestDTO } from './dtos/fetchDrownessRequest.dto';
import { InternalGuard } from './guards/internal.guard';
import { StatisticService } from './statistic.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { User } from '../user/entities/user.entity';

@Controller('internal/statistic')
export class StatisticInternalController {
  constructor(
    private readonly statisticService: StatisticService
  ) { };
  
  @UseGuards(InternalGuard)
  @UseGuards(AuthGuard("jwt-access"))
  @Post()
  async fetchStatistic(@Body() dto: fetchDrownessRequestDTO[], @GetUser() user: any) {
    this.statisticService.setStatistic(dto, user);
  }
}
