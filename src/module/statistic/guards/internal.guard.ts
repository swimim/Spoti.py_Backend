import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class InternalGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
  ) { };

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['internal-token'];
    return token === this.configService.get<string>("INTERNAL_TOKEN");
  }
}