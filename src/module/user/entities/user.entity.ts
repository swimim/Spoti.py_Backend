import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuthMethod } from "../enums/auth-method.enum";
import { Drowsiness } from "src/module/statistic/entities/drowsiness.entity";

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

  @OneToMany(() => Drowsiness, (drowsiness) => drowsiness.user)
  drowsinessList: Drowsiness[];

}