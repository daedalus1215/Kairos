import { IsString, IsOptional, IsArray, IsInt, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMeetingDto {
  @ApiProperty({ example: 'Sprint Planning' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: [1, 2, 3], required: false })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  participantIds?: number[];
}
