import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { SignupDTO } from './dtos/signup.dto';
import { AuthenticationProvidersENUM } from '../auth/enums/auth-provider.enum';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    async getUserInfo(user: any) {
        const userInfo = await this.userRepository.findOne({
            where: { idx: user.user_idx },
        })

        if (!userInfo) throw new NotFoundException('사용자가 존재하지 않습니다.');

        return { username: userInfo.firstName + userInfo.lastName, score: userInfo.score }
    }

    // 추후 Google-OAuth 전략에서 재활용 가능할 듯
    async signup(provider = AuthenticationProvidersENUM.NATIVE, dto: SignupDTO) {
        const existingUserId = await this.userRepository.findOne({ where: { userId: dto.userId } });

        if (existingUserId) throw new ConflictException('이미 존재하는 아이디입니다.');

        if (dto.password != dto.confirmPassword) throw new BadRequestException('비밀번호가 일치하지 않습니다.');

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = this.userRepository.create({
            userId: dto.userId,
            password: hashedPassword,
            provider,
            email: dto.email
        });

        await this.userRepository.save(user);

        return;
    }
}
