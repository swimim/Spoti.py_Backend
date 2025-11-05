import { Injectable } from '@nestjs/common';
import pkg from '../package.json';
import { uptime } from 'process';

@Injectable()
export class AppService {
  getServerInformation() {
    let runningtime: number | string = Math.round(uptime());
    runningtime = ((runningtime < 60)
      ? runningtime + " Seconds"
      : ((runningtime >= 60 && runningtime < 3600)
        ? (Math.floor((runningtime / 60) * 100) / 100) + " Minutes"    // 분
        : (Math.floor((runningtime / 3600) * 100) / 100) + " Hours")); // 시

    return {
      status: "Running",
      timestamp: new Date(),
      uptime: runningtime,
      version: pkg.version,
      description: pkg.description,
    };
  }
}
