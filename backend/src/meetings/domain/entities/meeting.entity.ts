import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const MEETING_STATUS = {
  ACTIVE: 'active',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
} as const;

export type MeetingStatus = (typeof MEETING_STATUS)[keyof typeof MEETING_STATUS];

@Entity({ name: 'meetings' })
export class Meeting {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title!: string;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime!: Date;

  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime!: Date | null;

  @Column({
    name: 'total_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalCost!: number;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: MEETING_STATUS.ACTIVE,
  })
  status!: MeetingStatus;

  @Column({ name: 'paused_at', type: 'timestamptz', nullable: true })
  pausedAt!: Date | null;

  @Column({
    name: 'total_paused_seconds',
    type: 'int',
    default: 0,
  })
  totalPausedSeconds!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;


}
