import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-jwt';
import { Request } from "express";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const refreshToken = req?.cookies?.['refreshToken'];
        return refreshToken;
      },
      secretOrKey: configService.get('TOKEN_SECRET'),
      passReqToCallback: true
    })
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException('토큰이 쿠키에 존재하지 않습니다.');

    await this.authService.validateRefreshToken(refreshToken);

    return { userIdx: payload.sub };
  }
}