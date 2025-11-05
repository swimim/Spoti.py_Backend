// EAR 
import { User } from "src/module/user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class DrowsinessStat {
  @PrimaryGeneratedColumn()
  idx: number;

  @OneToOne(() => User, (user) => user.drowsinessList)
  @JoinColumn({ name: "user_idx" })
  user: User;

  @Column({ nullable: false, name: "average_ear_smooth", type: "double", default: 0.21 })
  averageEarSmooth: number;

}