import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, InsertResult, UpdateResult } from 'typeorm';
import { MessageEntity } from '../entities/message.entity';
import { TagEntity } from '../../tag/entities/tag.entity';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MessageNotFoundException } from '../exceptions/message-not-found.exception';
import { NotMessageAuthorException } from '../exceptions/not-message-author.exception';
import { UpdateMessageCommand } from './update-message.command';

describe('UpdateMessageCommand', () => {
  let command: UpdateMessageCommand;
  let messageRepository: jest.Mocked<Repository<MessageEntity>>;
  let tagRepository: jest.Mocked<Repository<TagEntity>>;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTag = {
    id: 'tag-uuid',
    name: 'Tech',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMessage = {
    id: 'message-uuid',
    content: 'Original message',
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: mockUser.id,
    tagId: mockTag.id,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMessageCommand,
        {
          provide: getRepositoryToken(MessageEntity),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TagEntity),
          useValue: {
            findOne: jest.fn(),
            insert: jest.fn(),
          },
        },
      ],
    }).compile();

    command = module.get<UpdateMessageCommand>(UpdateMessageCommand);
    messageRepository = module.get(getRepositoryToken(MessageEntity));
    tagRepository = module.get(getRepositoryToken(TagEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update message content successfully', async () => {
      const updateDto: UpdateMessageDto = { content: 'Updated content' };
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      messageRepository.update.mockResolvedValue({} as UpdateResult);

      await command.execute(mockUser.id, mockMessage.id, updateDto);

      expect(messageRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockMessage.id },
        select: ['id', 'authorId', 'tagId'],
      });
      expect(messageRepository.update).toHaveBeenCalledWith(
        { id: mockMessage.id, deletedAt: expect.any(Object) },
        { content: 'Updated content' }
      );
    });

    it('should update message tag successfully', async () => {
      const updateDto: UpdateMessageDto = { tagName: 'NewTag' };
      const newTag = { ...mockTag, id: 'new-tag-uuid', name: 'NewTag' };
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      tagRepository.findOne.mockResolvedValue(newTag as any);
      messageRepository.update.mockResolvedValue({} as UpdateResult);

      await command.execute(mockUser.id, mockMessage.id, updateDto);

      expect(tagRepository.findOne).toHaveBeenCalledWith({ where: { name: 'NewTag' } });
      expect(messageRepository.update).toHaveBeenCalledWith(
        { id: mockMessage.id, deletedAt: expect.any(Object) },
        { tagId: newTag.id }
      );
    });

    it('should update both content and tag successfully', async () => {
      const updateDto: UpdateMessageDto = { 
        content: 'Updated content', 
        tagName: 'NewTag' 
      };
      const newTag = { ...mockTag, id: 'new-tag-uuid', name: 'NewTag' };
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      tagRepository.findOne.mockResolvedValue(newTag as any);
      messageRepository.update.mockResolvedValue({} as UpdateResult);

      await command.execute(mockUser.id, mockMessage.id, updateDto);

      expect(messageRepository.update).toHaveBeenCalledWith(
        { id: mockMessage.id, deletedAt: expect.any(Object) },
        { content: 'Updated content', tagId: newTag.id }
      );
    });

    it('should create new tag when tag does not exist', async () => {
      const updateDto: UpdateMessageDto = { tagName: 'BrandNewTag' };
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      tagRepository.findOne.mockResolvedValue(null);
      tagRepository.insert.mockResolvedValue({ 
        identifiers: [{ id: 'new-tag-id' }],
        generatedMaps: [],
        raw: []
      } as InsertResult);
      messageRepository.update.mockResolvedValue({} as UpdateResult);

      await command.execute(mockUser.id, mockMessage.id, updateDto);

      expect(tagRepository.findOne).toHaveBeenCalledWith({ where: { name: 'BrandNewTag' } });
      expect(tagRepository.insert).toHaveBeenCalledWith({ name: 'BrandNewTag' });
      expect(messageRepository.update).toHaveBeenCalledWith(
        { id: mockMessage.id, deletedAt: expect.any(Object) },
        { tagId: 'new-tag-id' }
      );
    });

    it('should throw MessageNotFoundException when message does not exist', async () => {
      const updateDto: UpdateMessageDto = { content: 'Updated content' };
      
      messageRepository.findOne.mockResolvedValue(null);

      await expect(command.execute(mockUser.id, 'non-existent-id', updateDto)).rejects.toThrow(
        MessageNotFoundException
      );

      expect(messageRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        select: ['id', 'authorId', 'tagId'],
      });
      expect(messageRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotMessageAuthorException when user is not the author', async () => {
      const updateDto: UpdateMessageDto = { content: 'Updated content' };
      const otherUser = { ...mockUser, id: 'other-user-id' };
      const messageByOtherUser = { ...mockMessage, authorId: otherUser.id };
      
      messageRepository.findOne.mockResolvedValue(messageByOtherUser as any);

      await expect(command.execute(mockUser.id, messageByOtherUser.id, updateDto)).rejects.toThrow(
        NotMessageAuthorException
      );

      expect(messageRepository.update).not.toHaveBeenCalled();
    });

    it('should not update when no valid fields provided', async () => {
      const updateDto: UpdateMessageDto = {};
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);

      await command.execute(mockUser.id, mockMessage.id, updateDto);

      expect(messageRepository.update).not.toHaveBeenCalled();
    });

    it('should not update tag when tagName is the same as current tag', async () => {
      const updateDto: UpdateMessageDto = { tagName: mockTag.name };
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      tagRepository.findOne.mockResolvedValue(mockTag as any);
      messageRepository.update.mockResolvedValue({} as UpdateResult);

      await command.execute(mockUser.id, mockMessage.id, updateDto);

      expect(messageRepository.update).toHaveBeenCalledWith(
        { id: mockMessage.id, deletedAt: expect.any(Object) },
        { tagId: mockTag.id }
      );
    });

    it('should handle database errors and throw InternalServerErrorException', async () => {
      const updateDto: UpdateMessageDto = { content: 'Updated content' };
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      messageRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(command.execute(mockUser.id, mockMessage.id, updateDto)).rejects.toThrow(
        InternalServerErrorException
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should handle tag repository errors and throw InternalServerErrorException', async () => {
      const updateDto: UpdateMessageDto = { tagName: 'NewTag' };
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      tagRepository.findOne.mockRejectedValue(new Error('Tag repository error'));

      await expect(command.execute(mockUser.id, mockMessage.id, updateDto)).rejects.toThrow(
        InternalServerErrorException
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should handle tag insert errors and throw InternalServerErrorException', async () => {
      const updateDto: UpdateMessageDto = { tagName: 'BrandNewTag' };
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      tagRepository.findOne.mockResolvedValue(null);
      tagRepository.insert.mockRejectedValue(new Error('Tag insert error'));

      await expect(command.execute(mockUser.id, mockMessage.id, updateDto)).rejects.toThrow(
        InternalServerErrorException
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should use IsNull for deletedAt check', async () => {
      const updateDto: UpdateMessageDto = { content: 'Updated content' };
      const { IsNull } = require('typeorm');
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      messageRepository.update.mockResolvedValue({} as UpdateResult);

      await command.execute(mockUser.id, mockMessage.id, updateDto);

      expect(messageRepository.update).toHaveBeenCalledWith(
        { id: mockMessage.id, deletedAt: IsNull() },
        { content: 'Updated content' }
      );
    });

    it('should work with minimal update payload', async () => {
      const updateDto: UpdateMessageDto = { content: 'Minimal update' };
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      messageRepository.update.mockResolvedValue({} as UpdateResult);

      await command.execute(mockUser.id, mockMessage.id, updateDto);

      expect(messageRepository.update).toHaveBeenCalledTimes(1);
      expect(messageRepository.update).toHaveBeenCalledWith(
        { id: mockMessage.id, deletedAt: expect.any(Object) },
        { content: 'Minimal update' }
      );
    });

    it('should handle empty update payload gracefully', async () => {
      const updateDto: UpdateMessageDto = {};
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);

      await command.execute(mockUser.id, mockMessage.id, updateDto);

      expect(messageRepository.findOne).toHaveBeenCalled();
      expect(messageRepository.update).not.toHaveBeenCalled();
    });
  });
});
