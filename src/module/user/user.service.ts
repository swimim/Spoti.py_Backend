import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { user } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { SignupDTO } from './dto/signup.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(user)
        private readonly userRepository: Repository<user>
    ) {}

    async signup(dto: SignupDTO) {
        const existId = await this.userRepository.findOne({ where: { user_id: dto.user_id }});

        if (existId != null) {
            throw new ConflictException('이미 존재하는 아이디입니다.');
        }

        if (dto.password != dto.confirmPassword) {
            throw new BadRequestException('비밀번호가 일치하지 않습니다.');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = this.userRepository.create({
            user_id: dto.user_id,
            password: hashedPassword
        });

        await this.userRepository.save(user);
    }
}
