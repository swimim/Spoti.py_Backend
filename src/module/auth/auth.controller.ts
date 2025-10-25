import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDTO } from './dtos/signin.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { GoogleGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('/signin')
    signin(@Body() dto: SigninDTO) {
        return this.authService.signin(dto);
    }

    @UseGuards(GoogleGuard)
    @Post('/google/signin')
    googleAuth() {
        return;
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
}
