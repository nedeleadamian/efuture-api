import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { MessageEntity } from '../entities/message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageResponseDto } from '../dto/message-response.dto';
import { TagEntity } from '../../tag/entities/tag.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { UserNotFoundException } from '../../user/exceptions/user-not-found.exception';

@Injectable()
export class CreateMessageCommand {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  public async execute(
    authorId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    const { content, tagName } = createMessageDto;

    const author = await this.userRepository.findOne({
      where: { id: authorId },
      select: ['id', 'email'],
    });

    if (!author) throw new UserNotFoundException();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let tag = await this.tagRepository.findOne({ where: { name: tagName } });

      if (!tag) {
        const insertResult = await queryRunner.manager.insert(TagEntity, { name: tagName });

        tag = {
          id: insertResult.identifiers[0].id,
          name: tagName,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as TagEntity;
      }

      const insertResult = await queryRunner.manager.insert(MessageEntity, {
        content,
        authorId: author.id,
        tagId: tag.id,
      });

      const newMessageId = insertResult.identifiers[0].id;

      await queryRunner.commitTransaction();

      const responseEntity = {
        id: newMessageId,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: author,
        tag: tag,
      };

      return plainToInstance(MessageResponseDto, responseEntity, {
        excludeExtraneousValues: true,
      });
    } catch {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Could not create message');
    } finally {
      await queryRunner.release();
    }
  }
}
