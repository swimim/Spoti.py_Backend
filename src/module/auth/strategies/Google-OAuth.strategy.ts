import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { User } from 'src/module/user/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthenticationProvidersENUM } from '../enums/auth-provider.enum';
import { JwtService } from '@nestjs/jwt';
import { refreshToken } from '../entities/refreshToken.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(refreshToken)
    private readonly refreshTokenRepository: Repository<refreshToken>,
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
  ) {
    super({
      clientID:
        configService.get<string>("GOOGLE_CLIENT_ID"),
      clientSecret: configService.get<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL: 'http://localhost:3000/auth/google/redirect', // redirect_uri
      passReqToCallback: true,
      scope: ['profile', 'email'], // 가져올 정보들
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ) {
    try {
      console.log(profile);

      // 로그인을 사도하는 사용자의 이메일이 존재하지 않는다면 자동 회원가입 진행
      let user = await this.userRespository.findOneBy({ email: profile.emails[0].value })
      console.log(user)
      if (!user) {
        console.log("flag1")
        const newUser = this.userRespository.create({
          firstName: profile.name.familyName ?? null,
          lastName: profile.name.givenName,
          provider: AuthenticationProvidersENUM.GOOGLE,
          providerId: profile.id,
          email: profile.emails[0].value
        })

        user = await this.userRespository.save(newUser);
      }

      const payload = { sub: user.email };

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);

      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '14d'
      });

      console.log(user)

      await this.refreshTokenRepository.save({ userIdx: user.idx, refreshToken, expiresAt });

      done(null, { accessToken, refreshToken });
    } catch (err) {
      console.error(err);
      done(err, false);
    }
  }
}