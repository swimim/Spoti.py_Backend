import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user } from '../user/entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { refreshToken } from './entity/refreshToken.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtRefreshStretagy } from './strategy/jwt-refresh.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([user, refreshToken]),
      JwtModule.registerAsync({
        global: true,
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get('TOKEN_SECRET'),
          signOptions: { expiresIn: '5m' },
        }),
        inject: [ConfigService]
      }),
      PassportModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtRefreshStretagy]
})
export class AuthModule {}
