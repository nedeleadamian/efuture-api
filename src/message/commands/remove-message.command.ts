import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageNotFoundException } from '../exceptions/message-not-found.exception';
import { NotMessageAuthorException } from '../exceptions/not-message-author.exception';
import { MessageEntity } from '../entities/message.entity';

@Injectable()
export class RemoveMessageCommand {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  public async execute(id: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id },
      select: ['id', 'authorId'],
    });

    if (!message) {
      throw new MessageNotFoundException();
    }

    if (message.authorId !== userId) {
      throw new NotMessageAuthorException();
    }

    await this.messageRepository.softDelete(id);
  }
}
