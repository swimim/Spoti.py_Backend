import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { user } from '../user/entity/user.entity';
import { SigninDTO } from './dto/signin.dto';
import { refreshToken } from './entity/refreshToken.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(user)
        private readonly userRepository: Repository<user>,
        @InjectRepository(refreshToken)
        private readonly refreshTokenRepository: Repository<refreshToken>,
        private readonly jwtService: JwtService
    ) {}

    async signin(dto: SigninDTO) {
        const user = await this.userRepository.findOne({ where: { user_id: dto.user_id } });

        if (user == null) {
            throw new BadRequestException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);

        if (!isMatch) {
            throw new BadRequestException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        const payload = { sub: user.idx };

        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '14d'
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 14);

        await this.refreshTokenRepository.save({ refreshToken, expiresAt });

        return { accessToken, refreshToken };
    }

    async refreshAccessToken(userId: number) {
        const accessToken = await this.jwtService.signAsync({ sub: userId });

        return { accessToken};
    }

    async logout(refreshToken: string) {
        await this.refreshTokenRepository.delete({ refreshToken });
    }
}