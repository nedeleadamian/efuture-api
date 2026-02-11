import { Test, TestingModule } from '@nestjs/testing';
import { Repository, DeleteResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RemoveMessageCommand } from './remove-message.command';
import { MessageEntity } from '../entities/message.entity';
import { MessageNotFoundException } from '../exceptions/message-not-found.exception';
import { NotMessageAuthorException } from '../exceptions/not-message-author.exception';

describe('RemoveMessageCommand', () => {
  let command: RemoveMessageCommand;
  let messageRepository: jest.Mocked<Repository<MessageEntity>>;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMessage = {
    id: 'message-uuid',
    content: 'Test message',
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: mockUser.id,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveMessageCommand,
        {
          provide: getRepositoryToken(MessageEntity),
          useValue: {
            findOne: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    command = module.get<RemoveMessageCommand>(RemoveMessageCommand);
    messageRepository = module.get(getRepositoryToken(MessageEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should soft delete message successfully when user is the author', async () => {
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      (messageRepository.softDelete as unknown as jest.Mock).mockResolvedValue({
        affected: 1,
        raw: {},
      } as DeleteResult);

      await command.execute(mockMessage.id, mockUser.id);

      expect(messageRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockMessage.id },
        select: ['id', 'authorId'],
      });
      expect(messageRepository.softDelete).toHaveBeenCalledWith(mockMessage.id);
    });

    it('should throw MessageNotFoundException when message does not exist', async () => {
      messageRepository.findOne.mockResolvedValue(null);

      await expect(command.execute('non-existent-id', mockUser.id)).rejects.toThrow(
        MessageNotFoundException
      );

      expect(messageRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        select: ['id', 'authorId'],
      });
      expect(messageRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw NotMessageAuthorException when user is not the author', async () => {
      const otherUser = { ...mockUser, id: 'other-user-id' };
      const messageByOtherUser = { ...mockMessage, authorId: otherUser.id };
      
      messageRepository.findOne.mockResolvedValue(messageByOtherUser as any);

      await expect(command.execute(messageByOtherUser.id, mockUser.id)).rejects.toThrow(
        NotMessageAuthorException
      );

      expect(messageRepository.findOne).toHaveBeenCalledWith({
        where: { id: messageByOtherUser.id },
        select: ['id', 'authorId'],
      });
      expect(messageRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should handle soft delete errors gracefully', async () => {
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      messageRepository.softDelete.mockRejectedValue(new Error('Database error'));

      await expect(command.execute(mockMessage.id, mockUser.id)).rejects.toThrow(
        'Database error'
      );

      expect(messageRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockMessage.id },
        select: ['id', 'authorId'],
      });
      expect(messageRepository.softDelete).toHaveBeenCalledWith(mockMessage.id);
    });

    it('should work with valid UUID format message ID', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const messageWithValidId = { ...mockMessage, id: validUuid };
      
      messageRepository.findOne.mockResolvedValue(messageWithValidId as any);
      (messageRepository.softDelete as unknown as jest.Mock).mockResolvedValue({
        affected: 1,
        raw: {},
      } as DeleteResult);

      await command.execute(validUuid, mockUser.id);

      expect(messageRepository.findOne).toHaveBeenCalledWith({
        where: { id: validUuid },
        select: ['id', 'authorId'],
      });
      expect(messageRepository.softDelete).toHaveBeenCalledWith(validUuid);
    });

    it('should not call softDelete when message is not found', async () => {
      messageRepository.findOne.mockResolvedValue(null);

      await expect(command.execute('non-existent-id', mockUser.id)).rejects.toThrow(
        MessageNotFoundException
      );

      expect(messageRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should not call softDelete when user is not author', async () => {
      const otherUser = { ...mockUser, id: 'other-user-id' };
      const messageByOtherUser = { ...mockMessage, authorId: otherUser.id };
      
      messageRepository.findOne.mockResolvedValue(messageByOtherUser as any);

      await expect(command.execute(messageByOtherUser.id, mockUser.id)).rejects.toThrow(
        NotMessageAuthorException
      );

      expect(messageRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should handle empty string message ID', async () => {
      messageRepository.findOne.mockResolvedValue(null);

      await expect(command.execute('', mockUser.id)).rejects.toThrow(
        MessageNotFoundException
      );

      expect(messageRepository.findOne).toHaveBeenCalledWith({
        where: { id: '' },
        select: ['id', 'authorId'],
      });
    });

    it('should handle null user ID', async () => {
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      (messageRepository.softDelete as unknown as jest.Mock).mockResolvedValue({
        affected: 1,
        raw: {},
      } as DeleteResult);

      await expect(command.execute(mockMessage.id, null as any)).rejects.toThrow(
        NotMessageAuthorException,
      );

      expect(messageRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockMessage.id },
        select: ['id', 'authorId'],
      });
    });

    it('should verify author ID comparison is strict', async () => {
      const messageWithDifferentAuthor = { ...mockMessage, authorId: 'different-author-id' };
      
      messageRepository.findOne.mockResolvedValue(messageWithDifferentAuthor as any);

      await expect(command.execute(messageWithDifferentAuthor.id, mockUser.id)).rejects.toThrow(
        NotMessageAuthorException
      );

      expect(messageRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should return void when successful', async () => {
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      (messageRepository.softDelete as unknown as jest.Mock).mockResolvedValue({
        affected: 1,
        raw: {},
      } as DeleteResult);

      const result = await command.execute(mockMessage.id, mockUser.id);

      expect(result).toBeUndefined();
    });

    it('should handle repository findOne errors', async () => {
      messageRepository.findOne.mockRejectedValue(new Error('Repository error'));

      await expect(command.execute(mockMessage.id, mockUser.id)).rejects.toThrow(
        'Repository error'
      );

      expect(messageRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should use correct select fields for message lookup', async () => {
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      (messageRepository.softDelete as unknown as jest.Mock).mockResolvedValue({
        affected: 1,
        raw: {},
      } as DeleteResult);

      await command.execute(mockMessage.id, mockUser.id);

      expect(messageRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockMessage.id },
        select: ['id', 'authorId'],
      });
    });

    it('should handle softDelete returning DeleteResult with affected count', async () => {
      const mockDeleteResult: DeleteResult = {
        affected: 1,
        raw: {}
      };
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      messageRepository.softDelete.mockResolvedValue(mockDeleteResult);

      await command.execute(mockMessage.id, mockUser.id);

      expect(messageRepository.softDelete).toHaveBeenCalledWith(mockMessage.id);
    });

    it('should handle softDelete returning DeleteResult with zero affected', async () => {
      const mockDeleteResult: DeleteResult = {
        affected: 0,
        raw: {}
      };
      
      messageRepository.findOne.mockResolvedValue(mockMessage as any);
      messageRepository.softDelete.mockResolvedValue(mockDeleteResult);

      await command.execute(mockMessage.id, mockUser.id);

      expect(messageRepository.softDelete).toHaveBeenCalledWith(mockMessage.id);
    });
  });
});
