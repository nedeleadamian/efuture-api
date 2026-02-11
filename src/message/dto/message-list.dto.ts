import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { MessageResponseDto } from './message-response.dto';

export class MessageListMetaDto {
  @ApiProperty({ nullable: true })
  @Expose()
  nextCursor: string | null;

  @ApiProperty()
  @Expose()
  hasNextPage: boolean;
}

export class MessageListDto {
  @ApiProperty({ type: MessageResponseDto, isArray: true })
  @Expose()
  @Type(() => MessageResponseDto)
  data: MessageResponseDto[];

  @ApiProperty({ type: MessageListMetaDto })
  @Expose()
  @Type(() => MessageListMetaDto)
  meta: MessageListMetaDto;
}
