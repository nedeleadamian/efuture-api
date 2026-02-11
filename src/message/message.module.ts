import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { TagEntity } from '../tag/entities/tag.entity';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { CreateMessageCommand } from './commands/create-message.command';
import { FindAllMessagesCommand } from './commands/find-all-messages.command';
import { UpdateMessageCommand } from './commands/update-message.command';
import { RemoveMessageCommand } from './commands/remove-message.command';
import { MessageEntity } from './entities/message.entity';

const Commands = [
  CreateMessageCommand,
  FindAllMessagesCommand,
  UpdateMessageCommand,
  RemoveMessageCommand,
];

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, MessageEntity, TagEntity])],
  controllers: [MessageController],
  providers: [MessageService, ...Commands],
  exports: [MessageService],
})
export class MessageModule {}
