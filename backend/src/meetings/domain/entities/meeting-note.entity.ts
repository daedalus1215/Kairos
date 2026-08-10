import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'meeting_notes' })
export class MeetingNote {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ name: 'meeting_id', type: 'int' })
  meetingId!: number;

  @Column({ name: 'content', type: 'text' })
  content!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
