import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Drowsiness } from "src/module/statistic/entities/drowsiness.entity";
import { AuthenticationProvidersENUM } from "src/module/auth/enums/auth-provider.enum";
import { UserPreference } from "./userPreference.entity";

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ nullable: true, name: 'user_id' })
  userId: string;

  @Column({ nullable: true, length: 60 })
  password: string;

  @Column({ nullable: false })
  email: string

  @Column({ nullable: false, type: 'enum', enum: AuthenticationProvidersENUM, default: AuthenticationProvidersENUM.NATIVE })
  provider: AuthenticationProvidersENUM

  @OneToMany(() => Drowsiness, (drowsiness) => drowsiness.user)
  drowsinessList: Drowsiness[];

  @OneToOne(() => UserPreference, (preferences) => preferences.user)
  preferences: UserPreference;

  @Column({ nullable: true })
  providerId: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: false, default: 100 })
  score: number;
}
