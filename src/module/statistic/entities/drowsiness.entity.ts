import { User } from "src/module/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { EyeStatusENUM } from "../enums/eye-status.enum";

@Entity()
export class Drowsiness {
  @PrimaryGeneratedColumn()
  idx: number;

  @ManyToOne(() => User, (user) => user.drowsinessList)
  @JoinColumn({ name: "user_idx" })
  user: User;

  @CreateDateColumn()
  at: Date;

  @Column({ nullable: false, name: "ear_smooth" })
  earSmooth: number

  @Column({ nullable: false })
  status: EyeStatusENUM
}