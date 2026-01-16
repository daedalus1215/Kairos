import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMeetingNoteDto {
  @ApiProperty({ example: 'Discussed the new feature requirements' })
  @IsString()
  @MinLength(1)
  content: string;
}
