import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Meeting } from './domain/entities/meeting.entity';
import { MeetingParticipant } from './domain/entities/meeting-participant.entity';
import { MeetingNote } from './domain/entities/meeting-note.entity';
import { MeetingService } from './domain/services/meeting.service';
import { MeetingsGateway } from './apps/gateways/meetings.gateway';
import { ParticipantsModule } from 'src/participants/participants.module';
import { PARTICIPANT_AGGREGATOR } from './domain/ports/participant-aggregator.port';
import { actionRegistry } from './registries/action.registry';
import { repositoryRegistry } from './registries/repository.registry';
import { transactionScriptRegistry } from './registries/transaction-script.registry';
import { MeetingResponseMapper } from './domain/mappers/meeting-response.mapper';
import { MeetingCostMapper } from './domain/mappers/meeting-cost.mapper';
import { MeetingParticipantAssembler } from './domain/assemblers/meeting-participant.assembler';
import { MeetingNoteAssembler } from './domain/assemblers/meeting-note.assembler';

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
  controllers: [...actionRegistry],
  providers: [
    MeetingService,
    MeetingsGateway,
    MeetingResponseMapper,
    MeetingCostMapper,
    MeetingParticipantAssembler,
    MeetingNoteAssembler,
    ...repositoryRegistry,
    ...transactionScriptRegistry,
    {
      provide: PARTICIPANT_AGGREGATOR,
      useExisting: PARTICIPANT_AGGREGATOR,
    },
  ],
  exports: [MeetingService, MeetingsGateway],
})
export class MeetingsModule {}
