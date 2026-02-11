import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { CreateMessageCommand } from './commands/create-message.command';
import { FindAllMessagesCommand } from './commands/find-all-messages.command';
import { UpdateMessageCommand } from './commands/update-message.command';
import { RemoveMessageCommand } from './commands/remove-message.command';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FindAllMessagesDto } from './dto/find-all-messages.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { MessageListDto } from './dto/message-list.dto';

describe('MessageService', () => {
  let service: MessageService;
  let createMessageCommand: jest.Mocked<CreateMessageCommand>;
  let findAllMessagesCommand: jest.Mocked<FindAllMessagesCommand>;
  let updateMessageCommand: jest.Mocked<UpdateMessageCommand>;
  let removeMessageCommand: jest.Mocked<RemoveMessageCommand>;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMessageResponse: MessageResponseDto = {
    id: 'message-uuid',
    content: 'Test message',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: mockUser,
    tag: {
      id: 'tag-uuid',
      name: 'Tech',
    },
  };

  const mockMessageList: MessageListDto = {
    data: [mockMessageResponse],
    meta: {
      nextCursor: null,
      hasNextPage: false,
    },
  };

  beforeEach(async () => {
    const mockCreateMessageCommand = {
      execute: jest.fn(),
    };
    const mockFindAllMessagesCommand = {
      execute: jest.fn(),
    };
    const mockUpdateMessageCommand = {
      execute: jest.fn(),
    };
    const mockRemoveMessageCommand = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: CreateMessageCommand,
          useValue: mockCreateMessageCommand,
        },
        {
          provide: FindAllMessagesCommand,
          useValue: mockFindAllMessagesCommand,
        },
        {
          provide: UpdateMessageCommand,
          useValue: mockUpdateMessageCommand,
        },
        {
          provide: RemoveMessageCommand,
          useValue: mockRemoveMessageCommand,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    createMessageCommand = module.get(CreateMessageCommand);
    findAllMessagesCommand = module.get(FindAllMessagesCommand);
    updateMessageCommand = module.get(UpdateMessageCommand);
    removeMessageCommand = module.get(RemoveMessageCommand);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to CreateMessageCommand', async () => {
      const createDto: CreateMessageDto = {
        content: 'Test message',
        tagName: 'Tech',
      };

      createMessageCommand.execute.mockResolvedValue(mockMessageResponse);

      const result = await service.create(mockUser.id, createDto);

      expect(createMessageCommand.execute).toHaveBeenCalledWith(mockUser.id, createDto);
      expect(result).toEqual(mockMessageResponse);
    });

    it('should handle command execution errors', async () => {
      const createDto: CreateMessageDto = {
        content: 'Test message',
        tagName: 'Tech',
      };

      createMessageCommand.execute.mockRejectedValue(new Error('Command error'));

      await expect(service.create(mockUser.id, createDto)).rejects.toThrow('Command error');
      expect(createMessageCommand.execute).toHaveBeenCalledWith(mockUser.id, createDto);
    });

    it('should pass through all parameters correctly', async () => {
      const createDto: CreateMessageDto = {
        content: 'Another test message',
        tagName: 'Life',
      };
      const userId = 'different-user-id';

      createMessageCommand.execute.mockResolvedValue(mockMessageResponse);

      await service.create(userId, createDto);

      expect(createMessageCommand.execute).toHaveBeenCalledWith(userId, createDto);
    });

    it('should return the exact result from command', async () => {
      const createDto: CreateMessageDto = {
        content: 'Test message',
        tagName: 'Tech',
      };

      const expectedResult = {
        id: 'different-message-id',
        content: 'Different content',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: mockUser,
        tag: {
          id: 'different-tag-id',
          name: 'DifferentTag',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      createMessageCommand.execute.mockResolvedValue(expectedResult);

      const result = await service.create(mockUser.id, createDto);

      expect(result).toBe(expectedResult);
      expect(result).not.toBe(mockMessageResponse);
    });
  });

  describe('findAll', () => {
    it('should delegate to FindAllMessagesCommand', async () => {
      const query: FindAllMessagesDto = { limit: 20 };

      findAllMessagesCommand.execute.mockResolvedValue(mockMessageList);

      const result = await service.findAll(query);

      expect(findAllMessagesCommand.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockMessageList);
    });

    it('should handle command execution errors', async () => {
      const query: FindAllMessagesDto = { limit: 10 };

      findAllMessagesCommand.execute.mockRejectedValue(new Error('Query error'));

      await expect(service.findAll(query)).rejects.toThrow('Query error');
      expect(findAllMessagesCommand.execute).toHaveBeenCalledWith(query);
    });

    it('should pass through complex query parameters', async () => {
      const complexQuery: FindAllMessagesDto = {
        limit: 50,
        cursor: 'cursor-string',
        tagIds: ['tag-1', 'tag-2'],
        authorIds: ['author-1'],
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      };

      findAllMessagesCommand.execute.mockResolvedValue(mockMessageList);

      await service.findAll(complexQuery);

      expect(findAllMessagesCommand.execute).toHaveBeenCalledWith(complexQuery);
    });

    it('should return the exact result from command', async () => {
      const query: FindAllMessagesDto = { limit: 20 };

      const expectedResult: MessageListDto = {
        data: [
          {
            id: 'message-1',
            content: 'Message 1',
            createdAt: new Date(),
            updatedAt: new Date(),
            author: mockUser,
            tag: {
              id: 'tag-1',
              name: 'Tag1',
            },
          },
        ],
        meta: {
          nextCursor: 'next-cursor',
          hasNextPage: true,
        },
      };

      findAllMessagesCommand.execute.mockResolvedValue(expectedResult);

      const result = await service.findAll(query);

      expect(result).toBe(expectedResult);
      expect(result).not.toBe(mockMessageList);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateMessageCommand', async () => {
      const updateDto: UpdateMessageDto = { content: 'Updated content' };
      const messageId = 'message-uuid';

      updateMessageCommand.execute.mockResolvedValue(undefined);

      await service.update(mockUser.id, messageId, updateDto);

      expect(updateMessageCommand.execute).toHaveBeenCalledWith(mockUser.id, messageId, updateDto);
    });

    it('should handle command execution errors', async () => {
      const updateDto: UpdateMessageDto = { content: 'Updated content' };
      const messageId = 'message-uuid';

      updateMessageCommand.execute.mockRejectedValue(new Error('Update error'));

      await expect(service.update(mockUser.id, messageId, updateDto)).rejects.toThrow('Update error');
      expect(updateMessageCommand.execute).toHaveBeenCalledWith(mockUser.id, messageId, updateDto);
    });

    it('should pass through all parameters correctly', async () => {
      const updateDto: UpdateMessageDto = { 
        content: 'Different updated content',
        tagName: 'NewTag'
      };
      const userId = 'different-user-id';
      const messageId = 'different-message-id';

      updateMessageCommand.execute.mockResolvedValue(undefined);

      await service.update(userId, messageId, updateDto);

      expect(updateMessageCommand.execute).toHaveBeenCalledWith(userId, messageId, updateDto);
    });

    it('should handle empty update DTO', async () => {
      const updateDto: UpdateMessageDto = {};
      const messageId = 'message-uuid';

      updateMessageCommand.execute.mockResolvedValue(undefined);

      await service.update(mockUser.id, messageId, updateDto);

      expect(updateMessageCommand.execute).toHaveBeenCalledWith(mockUser.id, messageId, updateDto);
    });
  });

  describe('remove', () => {
    it('should delegate to RemoveMessageCommand', async () => {
      const messageId = 'message-uuid';

      removeMessageCommand.execute.mockResolvedValue(undefined);

      await service.remove(mockUser.id, messageId);

      expect(removeMessageCommand.execute).toHaveBeenCalledWith(messageId, mockUser.id);
    });

    it('should handle command execution errors', async () => {
      const messageId = 'message-uuid';

      removeMessageCommand.execute.mockRejectedValue(new Error('Delete error'));

      await expect(service.remove(mockUser.id, messageId)).rejects.toThrow('Delete error');
      expect(removeMessageCommand.execute).toHaveBeenCalledWith(messageId, mockUser.id);
    });

    it('should pass through all parameters correctly', async () => {
      const userId = 'different-user-id';
      const messageId = 'different-message-id';

      removeMessageCommand.execute.mockResolvedValue(undefined);

      await service.remove(userId, messageId);

      expect(removeMessageCommand.execute).toHaveBeenCalledWith(messageId, userId);
    });

    it('should handle valid UUID message ID', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      removeMessageCommand.execute.mockResolvedValue(undefined);

      await service.remove(mockUser.id, validUuid);

      expect(removeMessageCommand.execute).toHaveBeenCalledWith(validUuid, mockUser.id);
    });
  });

  describe('service integration', () => {
    it('should maintain parameter order for all methods', async () => {
      // Create
      const createDto: CreateMessageDto = { content: 'Test', tagName: 'Tech' };
      createMessageCommand.execute.mockResolvedValue(mockMessageResponse);
      await service.create('user-id', createDto);
      expect(createMessageCommand.execute).toHaveBeenCalledWith('user-id', createDto);

      // FindAll
      const query: FindAllMessagesDto = { limit: 20 };
      findAllMessagesCommand.execute.mockResolvedValue(mockMessageList);
      await service.findAll(query);
      expect(findAllMessagesCommand.execute).toHaveBeenCalledWith(query);

      // Update
      const updateDto: UpdateMessageDto = { content: 'Updated' };
      updateMessageCommand.execute.mockResolvedValue(undefined);
      await service.update('user-id', 'message-id', updateDto);
      expect(updateMessageCommand.execute).toHaveBeenCalledWith('user-id', 'message-id', updateDto);

      // Remove
      removeMessageCommand.execute.mockResolvedValue(undefined);
      await service.remove('user-id', 'message-id');
      expect(removeMessageCommand.execute).toHaveBeenCalledWith('message-id', 'user-id');
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(typeof service.create).toBe('function');
      expect(typeof service.findAll).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.remove).toBe('function');
    });
  });
});
