import { IsInt, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddParticipantDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  participantId: number;

  @ApiProperty({ example: 175.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rateOverride?: number;
}
