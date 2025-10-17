import { IsNotEmpty, IsString } from "class-validator";

export class SigninDTO {
    @IsNotEmpty()
    @IsString()
    user_id: string

    @IsNotEmpty()
    @IsString()
    password: string
}