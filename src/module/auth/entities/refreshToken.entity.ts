import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class refreshToken {
    @PrimaryGeneratedColumn()
    idx: number

    @Column({ nullable: false, name: 'user_idx' })
    userIdx: number

    @Column({ nullable: false, name: 'refresh_token', length: '255' })
    refreshToken: string

    @Column({ nullable: false, name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;
}