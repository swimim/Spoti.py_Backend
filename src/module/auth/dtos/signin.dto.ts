import { IsNotEmpty, IsString } from "class-validator";

export class SigninDTO {
    @IsNotEmpty()
    @IsString()
    userId: string

    @IsNotEmpty()
    @IsString()
    password: string
}