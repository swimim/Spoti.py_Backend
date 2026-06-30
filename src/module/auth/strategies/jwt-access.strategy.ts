import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

interface AccessTokenClaims {
  sub: number
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          const accessToken =
            request?.query?.accessToken ??
            request?.query?.access_token ??
            request?.query?.token;

          return typeof accessToken === 'string' ? accessToken : null;
        },
      ]),
      secretOrKey: configService.get('TOKEN_SECRET')
    });
  }
  
  validate(payload: AccessTokenClaims) {
    const response = { userIdx: payload.sub };
    return response;
  }
}
