import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'meeting_participants' })
export class MeetingParticipant {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'meeting_id', type: 'int' })
  meetingId: number;

  @Column({ name: 'participant_id', type: 'int' })
  participantId: number;

  @Column({ name: 'joined_at', type: 'datetime' })
  joinedAt: Date;

  @Column({ name: 'left_at', type: 'datetime', nullable: true })
  leftAt: Date | null;

  @Column({
    name: 'rate_override',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  rateOverride: number | null;

  @Column({
    name: 'cost_contribution',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  costContribution: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
