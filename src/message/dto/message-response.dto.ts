import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class AuthorResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;
}

class TagResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;
}

export class MessageResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: AuthorResponseDto })
  @Expose()
  @Type(() => AuthorResponseDto)
  author: AuthorResponseDto;

  @ApiProperty({ type: TagResponseDto })
  @Expose()
  @Type(() => TagResponseDto)
  tag: TagResponseDto;
}
