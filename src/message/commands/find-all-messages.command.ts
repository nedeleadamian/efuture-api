import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { MessageListDto } from '../dto/message-list.dto';
import { MessageEntity } from '../entities/message.entity';
import { FindAllMessagesDto } from '../dto/find-all-messages.dto';
import { UserEntity } from '../../user/entities/user.entity';
import { TagEntity } from '../../tag/entities/tag.entity';

@Injectable()
export class FindAllMessagesCommand {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  public async execute(query: FindAllMessagesDto): Promise<MessageListDto> {
    const { limit = 20, cursor, tagNames, authorIds, startDate, endDate } = query;

    const realLimit = limit + 1;



    const alias = MessageEntity.name;

    const qb = this.messageRepository.createQueryBuilder(alias);


    qb.select([`${alias}.id`, `${alias}.content`, `${alias}.createdAt`, `${alias}.updatedAt`]);



    qb.leftJoin(`${alias}.author`, UserEntity.name);
    qb.addSelect([`${UserEntity.name}.id`, `${UserEntity.name}.email`]);

    qb.leftJoin(`${alias}.tag`, TagEntity.name);
    qb.addSelect([`${TagEntity.name}.id`, `${TagEntity.name}.name`]);



    qb.andWhere(`${alias}.deletedAt IS NULL`);


    if (tagNames && tagNames.length > 0) {
      qb.andWhere(`${TagEntity.name}.name IN (:...tagNames)`, { tagNames });
    }


    if (authorIds && authorIds.length > 0) {
      qb.andWhere(`${alias}.authorId IN (:...authorIds)`, { authorIds });
    }


    if (cursor) {
      const decodedDate = new Date(Buffer.from(cursor, 'base64').toString('ascii'));
      qb.andWhere(`${alias}.createdAt < :cursorDate`, { cursorDate: decodedDate });
    }

    // Date Range
    if (startDate) {
      qb.andWhere(`${alias}.createdAt >= :startDate`, { startDate: new Date(startDate) });
    }

    if (endDate) {
      qb.andWhere(`${alias}.createdAt <= :endDate`, { endDate: new Date(endDate) });
    }

    // 5. Order & Limit
    qb.orderBy(`${alias}.createdAt`, 'DESC');
    qb.take(realLimit);

    // 6. Execute
    const messages = await qb.getMany();

    // 7. Pagination Meta Logic
    let nextCursor: string | null = null;

    if (messages.length > limit) {
      const nextItem = messages.pop();
      if (nextItem) {
        nextCursor = Buffer.from(nextItem.createdAt.toISOString()).toString('base64');
      }
    }

    return plainToInstance(
      MessageListDto,
      {
        data: messages,
        meta: {
          nextCursor,
          hasNextPage: !!nextCursor,
        },
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
