import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindAllMessagesCommand } from './find-all-messages.command';
import { MessageEntity } from '../entities/message.entity';
import { FindAllMessagesDto } from '../dto/find-all-messages.dto';
import { UserEntity } from '../../user/entities/user.entity';
import { TagEntity } from '../../tag/entities/tag.entity';

describe('FindAllMessagesCommand', () => {
  let command: FindAllMessagesCommand;
  let messageRepository: jest.Mocked<Repository<MessageEntity>>;
  let queryBuilder: any;

  const mockUser: UserEntity = {
    id: 'user-uuid',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserEntity;

  const mockTag: TagEntity = {
    id: 'tag-uuid',
    name: 'Tech',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as TagEntity;

  const mockMessages: MessageEntity[] = [
    {
      id: 'message-1',
      content: 'First message',
      createdAt: new Date('2024-01-01T12:00:00Z'),
      updatedAt: new Date('2024-01-01T12:00:00Z'),
      authorId: mockUser.id,
      tagId: mockTag.id,
      author: mockUser,
      tag: mockTag,
    } as MessageEntity,
    {
      id: 'message-2',
      content: 'Second message',
      createdAt: new Date('2024-01-01T11:00:00Z'),
      updatedAt: new Date('2024-01-01T11:00:00Z'),
      authorId: mockUser.id,
      tagId: mockTag.id,
      author: mockUser,
      tag: mockTag,
    } as MessageEntity,
  ];

  beforeEach(async () => {
    queryBuilder = {
      select: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllMessagesCommand,
        {
          provide: getRepositoryToken(MessageEntity),
          useValue: {
            createQueryBuilder: jest.fn(() => queryBuilder),
          },
        },
      ],
    }).compile();

    command = module.get<FindAllMessagesCommand>(FindAllMessagesCommand);
    messageRepository = module.get(getRepositoryToken(MessageEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return paginated messages without filters', async () => {
      queryBuilder.getMany.mockResolvedValue(mockMessages);

      const query: FindAllMessagesDto = { limit: 20 };
      const result = await command.execute(query);

      expect(messageRepository.createQueryBuilder).toHaveBeenCalledWith('MessageEntity');
      expect(queryBuilder.select).toHaveBeenCalledWith([
        'MessageEntity.id',
        'MessageEntity.content',
        'MessageEntity.createdAt',
        'MessageEntity.updatedAt',
      ]);
      expect(queryBuilder.leftJoin).toHaveBeenCalledWith('MessageEntity.author', 'author');
      expect(queryBuilder.addSelect).toHaveBeenCalledWith(['author.id', 'author.email']);
      expect(queryBuilder.leftJoin).toHaveBeenCalledWith('MessageEntity.tag', 'tag');
      expect(queryBuilder.addSelect).toHaveBeenCalledWith(['tag.id', 'tag.name']);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('MessageEntity.deletedAt IS NULL');
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('MessageEntity.createdAt', 'DESC');
      expect(queryBuilder.take).toHaveBeenCalledWith(21);
      expect(result.data).toEqual(mockMessages);
      expect(result.meta.nextCursor).toBeNull();
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('should return paginated messages with next cursor when more results exist', async () => {
      const messagesWithExtra = [...mockMessages, {
        id: 'message-3',
        content: 'Third message',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z'),
        authorId: mockUser.id,
        tagId: mockTag.id,
        author: mockUser,
        tag: mockTag,
      } as MessageEntity];

      queryBuilder.getMany.mockResolvedValue(messagesWithExtra);

      const query: FindAllMessagesDto = { limit: 2 };
      const result = await command.execute(query);

      expect(result.data).toHaveLength(2);
      expect(result.data).toEqual(mockMessages);
      expect(result.meta.nextCursor).toBe(Buffer.from('2024-01-01T10:00:00.000Z').toString('base64'));
      expect(result.meta.hasNextPage).toBe(true);
    });

    it('should filter by tag IDs', async () => {
      queryBuilder.getMany.mockResolvedValue(mockMessages);

      const query: FindAllMessagesDto = { limit: 20, tagIds: ['tag-1', 'tag-2'] };
      await command.execute(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('MessageEntity.tagId IN (:...tagIds)', {
        tagIds: ['tag-1', 'tag-2'],
      });
    });

    it('should filter by author IDs', async () => {
      queryBuilder.getMany.mockResolvedValue(mockMessages);

      const query: FindAllMessagesDto = { limit: 20, authorIds: ['author-1', 'author-2'] };
      await command.execute(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('MessageEntity.authorId IN (:...authorIds)', {
        authorIds: ['author-1', 'author-2'],
      });
    });

    it('should filter by cursor (pagination)', async () => {
      queryBuilder.getMany.mockResolvedValue(mockMessages);

      const cursorDate = new Date('2024-01-01T12:00:00Z');
      const cursor = Buffer.from(cursorDate.toISOString()).toString('base64');
      const query: FindAllMessagesDto = { limit: 20, cursor };
      await command.execute(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('MessageEntity.createdAt < :cursorDate', {
        cursorDate: cursorDate,
      });
    });

    it('should filter by start date', async () => {
      queryBuilder.getMany.mockResolvedValue(mockMessages);

      const startDate = '2024-01-01T00:00:00Z';
      const query: FindAllMessagesDto = { limit: 20, startDate };
      await command.execute(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('MessageEntity.createdAt >= :startDate', {
        startDate: new Date(startDate),
      });
    });

    it('should filter by end date', async () => {
      queryBuilder.getMany.mockResolvedValue(mockMessages);

      const endDate = '2024-01-31T23:59:59Z';
      const query: FindAllMessagesDto = { limit: 20, endDate };
      await command.execute(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('MessageEntity.createdAt <= :endDate', {
        endDate: new Date(endDate),
      });
    });

    it('should apply multiple filters together', async () => {
      queryBuilder.getMany.mockResolvedValue(mockMessages);

      const cursorDate = new Date('2024-01-01T12:00:00Z');
      const cursor = Buffer.from(cursorDate.toISOString()).toString('base64');
      const query: FindAllMessagesDto = {
        tagIds: ['tag-1'],
        authorIds: ['author-1'],
        cursor,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        limit: 10,
      };
      await command.execute(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('MessageEntity.deletedAt IS NULL');
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('MessageEntity.tagId IN (:...tagIds)', {
        tagIds: ['tag-1'],
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('MessageEntity.authorId IN (:...authorIds)', {
        authorIds: ['author-1'],
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('MessageEntity.createdAt < :cursorDate', {
        cursorDate: cursorDate,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('MessageEntity.createdAt >= :startDate', {
        startDate: new Date('2024-01-01T00:00:00Z'),
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('MessageEntity.createdAt <= :endDate', {
        endDate: new Date('2024-01-31T23:59:59Z'),
      });
      expect(queryBuilder.take).toHaveBeenCalledWith(11);
    });

    it('should handle empty cursor gracefully', async () => {
      queryBuilder.getMany.mockResolvedValue(mockMessages);

      const query: FindAllMessagesDto = { limit: 20, cursor: undefined };
      await command.execute(query);

      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        'MessageEntity.createdAt < :cursorDate',
        expect.any(Object),
      );
    });

    it('should handle invalid cursor gracefully', async () => {
      queryBuilder.getMany.mockResolvedValue(mockMessages);

      const query: FindAllMessagesDto = { limit: 20, cursor: 'invalid-base64' };
      await command.execute(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'MessageEntity.createdAt < :cursorDate',
        expect.objectContaining({
          cursorDate: expect.any(Date),
        }),
      );
    });

    it('should use default limit when not provided', async () => {
      queryBuilder.getMany.mockResolvedValue(mockMessages);

      const query: FindAllMessagesDto = { limit: 20 };
      await command.execute(query);

      expect(queryBuilder.take).toHaveBeenCalledWith(21);
    });

    it('should use custom limit when provided', async () => {
      queryBuilder.getMany.mockResolvedValue(mockMessages);

      const query: FindAllMessagesDto = { limit: 50 };
      await command.execute(query);

      expect(queryBuilder.take).toHaveBeenCalledWith(51);
    });

    it('should handle empty results', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      const query: FindAllMessagesDto = { limit: 20 };
      const result = await command.execute(query);

      expect(result.data).toEqual([]);
      expect(result.meta.nextCursor).toBeNull();
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('should handle single message result', async () => {
      queryBuilder.getMany.mockResolvedValue([mockMessages[0]]);

      const query: FindAllMessagesDto = { limit: 20 };
      const result = await command.execute(query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(mockMessages[0]);
      expect(result.meta.nextCursor).toBeNull();
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('should create proper base64 cursor from date', async () => {
      const testDate = new Date('2024-01-01T12:30:45.123Z');
      const messageWithDate = {
        ...mockMessages[0],
        createdAt: testDate,
      };
      
      queryBuilder.getMany.mockResolvedValue([messageWithDate, mockMessages[1]]);

      const query: FindAllMessagesDto = { limit: 1 };
      const result = await command.execute(query);

      expect(result.meta.nextCursor).toBe(
        Buffer.from(mockMessages[1].createdAt.toISOString()).toString('base64'),
      );
    });
  });
});
