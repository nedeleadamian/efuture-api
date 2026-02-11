import { ApiPropertyOptional } from '@nestjs/swagger';
import { CursorPaginationDto } from '@common/dto/cursor-pagination.dto';
import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class FindAllMessagesDto extends CursorPaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by one or more Tag IDs. Pass multiple times for multiple tags.',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  tagNames?: string[];

  @ApiPropertyOptional({
    description: 'Filter by one or more Author IDs.',
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsUUID('4', { each: true })
  authorIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter messages created AFTER this date (ISO 8601)',
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter messages created BEFORE this date (ISO 8601)',
    example: '2023-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
