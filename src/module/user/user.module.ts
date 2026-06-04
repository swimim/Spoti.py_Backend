import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserPreference } from './entities/userPreference.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserPreference])
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
