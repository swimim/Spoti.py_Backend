import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AuthMethod } from "../enums/auth-method.enum";

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ nullable: false, name: 'user_id' })
  userId: string;

  @Column({ nullable: false, length: 60 })
  password: string;

  @Column({ nullable: true })
  email: string

  @Column({ nullable: false, type: 'enum', enum: AuthMethod })
  method: AuthMethod
}