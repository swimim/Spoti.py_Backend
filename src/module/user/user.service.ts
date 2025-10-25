import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { SignupDTO } from './dtos/signup.dto';
import { AuthMethod } from './enums/auth-method.enum';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async signup(method: AuthMethod, dto: SignupDTO) {
        // method가 native인 경우
        if (method === AuthMethod.native) {
            const existingUserId = await this.userRepository.findOne({ where: { userId: dto.userId }});

            if (existingUserId) throw new ConflictException('이미 존재하는 아이디입니다.');

            if (dto.password != dto.confirmPassword) throw new BadRequestException('비밀번호가 일치하지 않습니다.');

            const hashedPassword = await bcrypt.hash(dto.password, 10);

            const user = this.userRepository.create({
                userId: dto.userId,
                password: hashedPassword,
                method
            });

            await this.userRepository.save(user);

            return;
        }
        // method가 google인 경우
        if (method === AuthMethod.google) {
            // 
            return;
        }

        throw new BadRequestException('잘못된 인증 방식입니다.');
    }
}
