import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CursorPaginationDto {
  @ApiPropertyOptional({
    description: 'The number of items to return (default: 20)',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'The cursor for the next page (base64 encoded string)',
    example: 'MjAyMy0xMC0yNlQxMDo0NTowMC4wMDBa',
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}
