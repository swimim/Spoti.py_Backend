import {Body, Controller, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDTO } from './dtos/signup.dto';
import { AuthMethod } from './enums/auth-method.enum';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {}

    @Post('/signup')
    signup(
        @Query('method') method: AuthMethod,
        @Body() dto: SignupDTO
    ) {
        console.log(method, dto);
        return this.userService.signup(method, dto);
    }
}
