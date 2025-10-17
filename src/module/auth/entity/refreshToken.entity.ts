import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class refreshToken {
    @PrimaryGeneratedColumn()
    idx: number

    @Column({ nullable: false, length: '255' })
    refreshToken: string

    @Column({ type: 'timestamp', nullable: false })
    expiresAt: Date;
}