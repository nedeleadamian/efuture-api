import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { MessageEntity } from '../entities/message.entity';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { TagEntity } from '../../tag/entities/tag.entity';
import { MessageNotFoundException } from '../exceptions/message-not-found.exception';
import { NotMessageAuthorException } from '../exceptions/not-message-author.exception';

@Injectable()
export class UpdateMessageCommand {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  public async execute(userId: string, id: string, updateDto: UpdateMessageDto): Promise<void> {
    const { content, tagName } = updateDto;

    const message = await this.messageRepository.findOne({
      where: { id },
      select: ['id', 'authorId', 'tagId'],
    });

    if (!message) {
      throw new MessageNotFoundException();
    }

    if (message.authorId !== userId) {
      throw new NotMessageAuthorException();
    }

    const updatePayload: Partial<MessageEntity> = {};

    if (content) {
      updatePayload.content = content;
    }

    try {
      if (tagName) {
        let tagId = message.tagId;

        const tag = await this.tagRepository.findOne({ where: { name: tagName } });

        if (!tag) {
          const insertResult = await this.tagRepository.insert({ name: tagName });
          tagId = insertResult.identifiers[0].id;
        } else {
          tagId = tag.id;
        }

        updatePayload.tagId = tagId;
      }

      if (Object.keys(updatePayload).length > 0) {
        await this.messageRepository.update({ id, deletedAt: IsNull() }, updatePayload);
      }
    } catch (err) {
      console.error(err);

      throw new InternalServerErrorException();
    }
  }
}
