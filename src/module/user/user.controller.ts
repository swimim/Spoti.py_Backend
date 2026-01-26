import {Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDTO } from './dtos/signup.dto';
import { AuthenticationProvidersENUM } from '../auth/enums/auth-provider.enum';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

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
}
