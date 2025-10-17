import { Body, Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDTO } from './dto/signin.dto';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('signin')
    signin(@Body() dto: SigninDTO) {
        return this.authService.signin(dto);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    refreshAccessToken(@Req() req: any) {
        const userId = req.user.userId;
        return this.authService.refreshAccessToken(userId);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('logout')
    logout(@Req() req: any) {
        const refreshToken = req.user.refreshToken;
        return this.authService.logout(refreshToken);
    }
}
