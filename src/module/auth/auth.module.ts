import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../user/entities/user.entity';
import { refreshToken } from './entities/refreshToken.entity';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { GoogleStrategy } from './strategies/Google-OAuth.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, refreshToken]),
      JwtModule.registerAsync({
        global: true,
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get('TOKEN_SECRET'),
          signOptions: { expiresIn: '5h' },
        }),
        inject: [ConfigService]
      }),
      PassportModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    GoogleStrategy
  ]
})
export class AuthModule {}
