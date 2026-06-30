import {Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDTO } from './dtos/signup.dto';
import { AuthenticationProvidersENUM } from '../auth/enums/auth-provider.enum';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Preferences } from './dtos/preferences.dto';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @Get()
    @UseGuards(JwtAccessGuard)
    @ApiBearerAuth('jwt')
    async getUserInfo(@GetUser() user: any) {
        return this.userService.getUserInfo(user);
    }

    @Post('/signup')
    signup(
        @Body() dto: SignupDTO
    ) {
        return this.userService.signup(AuthenticationProvidersENUM.NATIVE, dto);
    }

    @Get('/settings')
    @UseGuards(JwtAccessGuard)
    @ApiBearerAuth('jwt')
    async getSettings(@GetUser() user: any) {
        return this.userService.getSettings(user.userIdx);
    }

    @Patch('/settings')
    @ApiBearerAuth('jwt')
    @UseGuards(JwtAccessGuard)
    async setPreferences(@GetUser() user: any, @Body() dto: Preferences) {
        return this.userService.setPreferences(user.userIdx, dto);
    }
}
