import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class user {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ nullable: false, unique: true })
  user_id: string;

  @Column({ nullable: false })
  password: string;
}