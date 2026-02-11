import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { DataSource, Repository } from 'typeorm';
import { MessageEntity } from '../entities/message.entity';
import { TagEntity } from '../../tag/entities/tag.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageResponseDto } from '../dto/message-response.dto';
import { CreateMessageCommand } from './create-message.command';

describe('CreateMessageCommand', () => {
  let command: CreateMessageCommand;
  let tagRepository: jest.Mocked<Repository<TagEntity>>;
  let userRepository: jest.Mocked<Repository<UserEntity>>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<any>;

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

  const mockMessage: MessageEntity = {
    id: 'message-uuid',
    content: 'Test message',
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: mockUser.id,
    tagId: mockTag.id,
  } as MessageEntity;

  beforeEach(async () => {
    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        insert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMessageCommand,
        {
          provide: getRepositoryToken(TagEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => mockQueryRunner),
          },
        },
      ],
    }).compile();

    command = module.get<CreateMessageCommand>(CreateMessageCommand);
    tagRepository = module.get(getRepositoryToken(TagEntity));
    userRepository = module.get(getRepositoryToken(UserEntity));
    dataSource = module.get(DataSource);
    queryRunner = mockQueryRunner;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createMessageDto: CreateMessageDto = {
      content: 'Test message content',
      tagName: 'Tech',
    };

    it('should create a message with existing tag successfully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      tagRepository.findOne.mockResolvedValue(mockTag);
      queryRunner.manager.insert
        .mockResolvedValueOnce({ identifiers: [{ id: mockMessage.id }] })
        .mockResolvedValueOnce({ identifiers: [{ id: mockTag.id }] });

      const result = await command.execute(mockUser.id, createMessageDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: ['id', 'email'],
      });
      expect(tagRepository.findOne).toHaveBeenCalledWith({
        where: { name: createMessageDto.tagName },
      });
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.insert).toHaveBeenCalledWith(
        MessageEntity,
        expect.objectContaining({
          content: createMessageDto.content,
          authorId: mockUser.id,
          tagId: mockTag.id,
        }),
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(result).toBeInstanceOf(MessageResponseDto);
      expect(result.content).toBe(createMessageDto.content);
    });

    it('should create a message with new tag successfully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      tagRepository.findOne.mockResolvedValue(null);
      queryRunner.manager.insert
        .mockResolvedValueOnce({ identifiers: [{ id: 'new-tag-uuid' }] })
        .mockResolvedValueOnce({ identifiers: [{ id: mockMessage.id }] });

      const result = await command.execute(mockUser.id, createMessageDto);

      expect(tagRepository.findOne).toHaveBeenCalledWith({
        where: { name: createMessageDto.tagName },
      });
      expect(queryRunner.manager.insert).toHaveBeenCalledWith(
        TagEntity,
        { name: createMessageDto.tagName },
      );
      expect(queryRunner.manager.insert).toHaveBeenCalledWith(
        MessageEntity,
        expect.objectContaining({
          content: createMessageDto.content,
          authorId: mockUser.id,
          tagId: 'new-tag-uuid',
        }),
      );
      expect(result).toBeInstanceOf(MessageResponseDto);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(command.execute('non-existent-user', createMessageDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-user' },
        select: ['id', 'email'],
      });
      expect(queryRunner.connect).not.toHaveBeenCalled();
    });

    it('should rollback transaction and throw InternalServerErrorException on error', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      tagRepository.findOne.mockResolvedValue(mockTag);
      queryRunner.manager.insert.mockRejectedValue(new Error('Database error'));

      await expect(command.execute(mockUser.id, createMessageDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should handle query runner release even if rollback fails', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      tagRepository.findOne.mockResolvedValue(mockTag);
      queryRunner.manager.insert.mockRejectedValue(new Error('Database error'));
      queryRunner.rollbackTransaction.mockRejectedValue(new Error('Rollback error'));

      await expect(command.execute(mockUser.id, createMessageDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should use plainToInstance with correct options', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      tagRepository.findOne.mockResolvedValue(mockTag);
      queryRunner.manager.insert
        .mockResolvedValueOnce({ identifiers: [{ id: mockMessage.id }] })
        .mockResolvedValueOnce({ identifiers: [{ id: mockTag.id }] });

      const plainToInstanceSpy = jest.spyOn(require('class-transformer'), 'plainToInstance');

      await command.execute(mockUser.id, createMessageDto);

      expect(plainToInstanceSpy).toHaveBeenCalledWith(
        MessageResponseDto,
        expect.objectContaining({
          id: mockMessage.id,
          content: createMessageDto.content,
          author: mockUser,
          tag: mockTag,
        }),
        { excludeExtraneousValues: true },
      );
    });

    it('should create minimal tag object when tag is newly created', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      tagRepository.findOne.mockResolvedValue(null);
      const newTagId = 'new-tag-uuid';
      queryRunner.manager.insert
        .mockResolvedValueOnce({ identifiers: [{ id: newTagId }] })
        .mockResolvedValueOnce({ identifiers: [{ id: mockMessage.id }] });

      const plainToInstanceSpy = jest.spyOn(require('class-transformer'), 'plainToInstance');

      await command.execute(mockUser.id, createMessageDto);

      expect(plainToInstanceSpy).toHaveBeenCalledWith(
        MessageResponseDto,
        expect.objectContaining({
          tag: expect.objectContaining({
            id: newTagId,
            name: createMessageDto.tagName,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
        }),
        { excludeExtraneousValues: true },
      );
    });
  });
});
