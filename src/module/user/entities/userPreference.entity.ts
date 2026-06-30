import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn()
  idx: number;

  @OneToOne(() => User, (user) => user.preferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_idx' })
  user: User;

  @Column({ nullable: false, name: 'siren_notification', default: true })
  sirenNotification: boolean;

  @Column({ nullable: false, name: 'toast_notification', default: true })
  toastNotification: boolean;
}
