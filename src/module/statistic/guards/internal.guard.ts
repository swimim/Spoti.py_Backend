import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['Internal-Token'];
    return token === process.env.INTERNAL_TOKEN;
  }
}