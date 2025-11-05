import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator"

export class SignupDTO {
    @IsNotEmpty()
    @IsString()
    @MinLength(5, { message: '아이디는 5자 이상이어야 합니다.' })
    @MaxLength(16, { message: '아이디는 16자 이하여야 합니다,' })
    userId: string

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword({
        minLength: 7,
        minLowercase: 0,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    }, { message: '비밀번호는 7자 이상이어야 하며, 1개 이상의 숫자, 특수문자, 대문자를 포함해야 합니다.' })
    password: string

    confirmPassword: string

    @IsEmail()
    @IsNotEmpty()
    email: string;
}