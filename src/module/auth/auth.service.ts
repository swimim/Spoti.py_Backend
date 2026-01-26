import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { refreshToken } from './entities/refreshToken.entity';
import { SigninDTO } from './dtos/signin.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(refreshToken)
        private readonly refreshTokenRepository: Repository<refreshToken>,
        private readonly jwtService: JwtService
    ) { }

    async validateRefreshToken(refreshToken: string) {
        const existingRefreshToken = await this.refreshTokenRepository.findOne({
            where: { refreshToken },
            select: ['expiresAt']
        });
        if (!existingRefreshToken) throw new UnauthorizedException('토큰을 찾을 수 없습니다.');

        if (Date.now() > existingRefreshToken.expiresAt.getTime()) {
            throw new UnauthorizedException('토큰이 만료되었습니다.');
        }
    }

    async signin(dto: SigninDTO) {
        const user = await this.userRepository.findOne({ where: { userId: dto.userId } });

        if (!user) throw new BadRequestException("아이디 또는 비밀번호가 일치하지 않습니다.");

        const isMatch = await bcrypt.compare(dto.password, user.password);

        if (!isMatch) throw new BadRequestException("아이디 또는 비밀번호가 일치하지 않습니다.");

        const payload = { sub: user.idx };

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 14);

        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '14d'
        });

        await this.refreshTokenRepository.save({ userIdx: user.idx, refreshToken, expiresAt });
        
        return { accessToken, refreshToken, username: user.firstName + user.lastName, score: user.score };
    }

    async refreshAccessToken(userIdx: number) {
        const accessToken = await this.jwtService.signAsync({ sub: userIdx });

        return { accessToken };
    }

    async logout(userIdx: number) {
        await this.refreshTokenRepository.delete({ userIdx });
    }
}