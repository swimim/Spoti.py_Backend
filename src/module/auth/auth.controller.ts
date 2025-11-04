import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDTO } from './dtos/signin.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Post('/signin')
    signin(@Body() dto: SigninDTO) {
        return this.authService.signin(dto);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('/refresh')
    refreshAccessToken(@GetUser() user: any) {
        const userIdx = user.userIdx;
        return this.authService.refreshAccessToken(userIdx);
    }

    @UseGuards(JwtAccessGuard)
    @Post('/logout')
    logout(@GetUser() user) {
        const userIdx = user.userIdx;
        return this.authService.logout(userIdx);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleLogin(): Promise<void> {
    }

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleLoginCallback(@Req() req, @Res() res): Promise<void> {
        const { accessToken, refreshToken } = req.user;

        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);

        if (isMobile) return res.redirect(`myapp://auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
        else return res.redirect(`${this.configService.get<string>("FRONTEND_URL")}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
}
