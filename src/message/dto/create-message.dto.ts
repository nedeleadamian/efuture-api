import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'The content of the message',
    maxLength: 240,
    example: 'Just finished the new NestJS module! #coding',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(240, { message: 'Message cannot be longer than 240 characters' })
  content: string;

  @ApiProperty({
    description: 'The name of the tag/category (e.g. "Tech", "Life")',
    example: 'Tech',
  })
  @IsString()
  @IsNotEmpty()
  tagName: string;
}
