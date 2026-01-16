import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Meeting } from './domain/entities/meeting.entity';
import { MeetingParticipant } from './domain/entities/meeting-participant.entity';
import { MeetingNote } from './domain/entities/meeting-note.entity';
import { MeetingRepository } from './infra/repositories/meeting.repository';
import { MeetingParticipantRepository } from './infra/repositories/meeting-participant.repository';
import { MeetingNoteRepository } from './infra/repositories/meeting-note.repository';
import { MeetingService } from './domain/services/meeting.service';
import { StartMeetingTransactionScript } from './domain/transaction-scripts/start-meeting-ts/start-meeting.transaction.script';
import { EndMeetingTransactionScript } from './domain/transaction-scripts/end-meeting-ts/end-meeting.transaction.script';
import { AddParticipantToMeetingTransactionScript } from './domain/transaction-scripts/add-participant-to-meeting-ts/add-participant-to-meeting.transaction.script';
import { RemoveParticipantFromMeetingTransactionScript } from './domain/transaction-scripts/remove-participant-from-meeting-ts/remove-participant-from-meeting.transaction.script';
import { CalculateMeetingCostTransactionScript } from './domain/transaction-scripts/calculate-meeting-cost-ts/calculate-meeting-cost.transaction.script';
import { MeetingsGateway } from './apps/gateways/meetings.gateway';
import { StartMeetingAction } from './apps/actions/start-meeting-action/start-meeting.action';
import { EndMeetingAction } from './apps/actions/end-meeting-action/end-meeting.action';
import { GetMeetingAction } from './apps/actions/get-meeting-action/get-meeting.action';
import { GetMeetingsAction } from './apps/actions/get-meetings-action/get-meetings.action';
import { GetActiveMeetingAction } from './apps/actions/get-active-meeting-action/get-active-meeting.action';
import { SearchMeetingsAction } from './apps/actions/search-meetings-action/search-meetings.action';
import { AddParticipantAction } from './apps/actions/add-participant-action/add-participant.action';
import { RemoveParticipantAction } from './apps/actions/remove-participant-action/remove-participant.action';
import { MeetingNotesAction } from './apps/actions/meeting-notes-action/meeting-notes.action';
import { ParticipantsModule } from 'src/participants/participants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting, MeetingParticipant, MeetingNote]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret',
        signOptions: { expiresIn: '7d' as const },
      }),
      inject: [ConfigService],
    }),
    ParticipantsModule,
  ],
  controllers: [
    // Routes with specific paths must come before parameterized routes
    GetActiveMeetingAction,
    SearchMeetingsAction,
    StartMeetingAction,
    EndMeetingAction,
    GetMeetingsAction,
    GetMeetingAction, // /:id route must be last
    AddParticipantAction,
    RemoveParticipantAction,
    MeetingNotesAction,
  ],
  providers: [
    MeetingRepository,
    MeetingParticipantRepository,
    MeetingNoteRepository,
    MeetingService,
    StartMeetingTransactionScript,
    EndMeetingTransactionScript,
    AddParticipantToMeetingTransactionScript,
    RemoveParticipantFromMeetingTransactionScript,
    CalculateMeetingCostTransactionScript,
    MeetingsGateway,
  ],
  exports: [MeetingService, MeetingsGateway],
})
export class MeetingsModule {}
