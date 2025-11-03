import {Body, Controller, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDTO } from './dtos/signup.dto';
import { AuthenticationProvidersENUM } from '../auth/enums/auth-provider.enum';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @Post('/signup')
    signup(
        @Body() dto: SignupDTO
    ) {
        return this.userService.signup(AuthenticationProvidersENUM.NATIVE, dto);
    }
}
