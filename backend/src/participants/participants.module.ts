import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participant } from './domain/entities/participant.entity';
import { ParticipantRepository } from './infra/repositories/participant.repository';
import { ParticipantService } from './domain/services/participant.service';
import { CreateParticipantTransactionScript } from './domain/transaction-scripts/create-participant-ts/create-participant.transaction.script';
import { UpdateParticipantTransactionScript } from './domain/transaction-scripts/update-participant-ts/update-participant.transaction.script';
import { DeleteParticipantTransactionScript } from './domain/transaction-scripts/delete-participant-ts/delete-participant.transaction.script';
import { CreateParticipantAction } from './apps/actions/create-participant-action/create-participant.action';
import { GetParticipantsAction } from './apps/actions/get-participants-action/get-participants.action';
import { GetParticipantAction } from './apps/actions/get-participant-action/get-participant.action';
import { UpdateParticipantAction } from './apps/actions/update-participant-action/update-participant.action';
import { DeleteParticipantAction } from './apps/actions/delete-participant-action/delete-participant.action';
import { ParticipantAggregator } from './domain/aggregators/participant-aggregator';
import { PARTICIPANT_AGGREGATOR } from 'src/meetings/domain/ports/participant-aggregator.port';

@Module({
  imports: [TypeOrmModule.forFeature([Participant])],
  controllers: [
    CreateParticipantAction,
    GetParticipantsAction,
    GetParticipantAction,
    UpdateParticipantAction,
    DeleteParticipantAction,
  ],
  providers: [
    ParticipantRepository,
    ParticipantService,
    CreateParticipantTransactionScript,
    UpdateParticipantTransactionScript,
    DeleteParticipantTransactionScript,
    ParticipantAggregator,
    {
      provide: PARTICIPANT_AGGREGATOR,
      useClass: ParticipantAggregator,
    },
  ],
  exports: [ParticipantRepository, ParticipantService, PARTICIPANT_AGGREGATOR],
})
export class ParticipantsModule {}
