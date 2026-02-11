import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FindAllMessagesDto } from './dto/find-all-messages.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { MessageListDto } from './dto/message-list.dto';
import { ActiveUserData } from '@core/auth/interfaces/active-user-data.interface';

describe('MessageController', () => {
  let controller: MessageController;
  let messageService: jest.Mocked<MessageService>;

  const mockActiveUser: ActiveUserData = {
    userId: 'user-uuid',
    email: 'test@example.com',
  };

  const mockMessageResponse: MessageResponseDto = {
    id: 'message-uuid',
    content: 'Test message',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: mockActiveUser.userId,
      email: mockActiveUser.email,
    },
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
    const mockMessageService = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    messageService = module.get(MessageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a message successfully', async () => {
      const createDto: CreateMessageDto = {
        content: 'Test message',
        tagName: 'Tech',
      };

      messageService.create.mockResolvedValue(mockMessageResponse);

      const result = await controller.create(createDto, mockActiveUser);

      expect(messageService.create).toHaveBeenCalledWith(mockActiveUser.userId, createDto);
      expect(result).toEqual(mockMessageResponse);
    });

    it('should handle service errors', async () => {
      const createDto: CreateMessageDto = {
        content: 'Test message',
        tagName: 'Tech',
      };

      messageService.create.mockRejectedValue(new Error('Service error'));

      await expect(controller.create(createDto, mockActiveUser)).rejects.toThrow('Service error');
      expect(messageService.create).toHaveBeenCalledWith(mockActiveUser.userId, createDto);
    });

    it('should pass through active user data correctly', async () => {
      const createDto: CreateMessageDto = {
        content: 'Test message',
        tagName: 'Tech',
      };
      const differentUser: ActiveUserData = {
        userId: 'different-user-id',
        email: 'different@example.com',
      };

      messageService.create.mockResolvedValue(mockMessageResponse);

      await controller.create(createDto, differentUser);

      expect(messageService.create).toHaveBeenCalledWith(differentUser.userId, createDto);
    });

    it('should handle validation errors from DTO', async () => {
      const invalidDto: CreateMessageDto = {
        content: '',
        tagName: '',
      };

      messageService.create.mockResolvedValue(mockMessageResponse);

      const result = await controller.create(invalidDto, mockActiveUser);

      expect(messageService.create).toHaveBeenCalledWith(mockActiveUser.userId, invalidDto);
      expect(result).toEqual(mockMessageResponse);
    });
  });

  describe('find', () => {
    it('should return paginated messages', async () => {
      const query: FindAllMessagesDto = { limit: 20 };

      messageService.findAll.mockResolvedValue(mockMessageList);

      const result = await controller.find(query);

      expect(messageService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockMessageList);
    });

    it('should handle complex query parameters', async () => {
      const complexQuery: FindAllMessagesDto = {
        limit: 50,
        cursor: 'cursor-string',
        tagIds: ['tag-1', 'tag-2'],
        authorIds: ['author-1'],
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      };

      messageService.findAll.mockResolvedValue(mockMessageList);

      const result = await controller.find(complexQuery);

      expect(messageService.findAll).toHaveBeenCalledWith(complexQuery);
      expect(result).toEqual(mockMessageList);
    });

    it('should handle service errors', async () => {
      const query: FindAllMessagesDto = { limit: 10 };

      messageService.findAll.mockRejectedValue(new Error('Query error'));

      await expect(controller.find(query)).rejects.toThrow('Query error');
      expect(messageService.findAll).toHaveBeenCalledWith(query);
    });

    it('should work without authentication (public endpoint)', async () => {
      const query: FindAllMessagesDto = { limit: 20 };

      messageService.findAll.mockResolvedValue(mockMessageList);

      const result = await controller.find(query);

      expect(messageService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockMessageList);
    });

    it('should handle empty query parameters', async () => {
      const query: FindAllMessagesDto = { limit: 20 };

      messageService.findAll.mockResolvedValue({ data: [], meta: { nextCursor: null, hasNextPage: false } });

      const result = await controller.find(query);

      expect(messageService.findAll).toHaveBeenCalledWith(query);
      expect(result.data).toEqual([]);
      expect(result.meta.hasNextPage).toBe(false);
    });
  });

  describe('update', () => {
    it('should update a message successfully', async () => {
      const updateDto: UpdateMessageDto = { content: 'Updated content' };
      const messageId = 'message-uuid';

      messageService.update.mockResolvedValue(undefined);

      await controller.update(messageId, updateDto, mockActiveUser);

      expect(messageService.update).toHaveBeenCalledWith(mockActiveUser.userId, messageId, updateDto);
    });

    it('should handle service errors', async () => {
      const updateDto: UpdateMessageDto = { content: 'Updated content' };
      const messageId = 'message-uuid';

      messageService.update.mockRejectedValue(new Error('Update error'));

      await expect(controller.update(messageId, updateDto, mockActiveUser)).rejects.toThrow('Update error');
      expect(messageService.update).toHaveBeenCalledWith(mockActiveUser.userId, messageId, updateDto);
    });

    it('should pass through all parameters correctly', async () => {
      const updateDto: UpdateMessageDto = { 
        content: 'Different updated content',
        tagName: 'NewTag'
      };
      const messageId = 'different-message-id';
      const differentUser: ActiveUserData = {
        userId: 'different-user-id',
        email: 'different@example.com',
      };

      messageService.update.mockResolvedValue(undefined);

      await controller.update(messageId, updateDto, differentUser);

      expect(messageService.update).toHaveBeenCalledWith(differentUser.userId, messageId, updateDto);
    });

    it('should handle empty update DTO', async () => {
      const updateDto: UpdateMessageDto = {};
      const messageId = 'message-uuid';

      messageService.update.mockResolvedValue(undefined);

      await controller.update(messageId, updateDto, mockActiveUser);

      expect(messageService.update).toHaveBeenCalledWith(mockActiveUser.userId, messageId, updateDto);
    });

    it('should handle valid UUID message ID', async () => {
      const updateDto: UpdateMessageDto = { content: 'Updated content' };
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      messageService.update.mockResolvedValue(undefined);

      await controller.update(validUuid, updateDto, mockActiveUser);

      expect(messageService.update).toHaveBeenCalledWith(mockActiveUser.userId, validUuid, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a message successfully', async () => {
      const messageId = 'message-uuid';

      messageService.remove.mockResolvedValue(undefined);

      await controller.remove(messageId, mockActiveUser);

      expect(messageService.remove).toHaveBeenCalledWith(mockActiveUser.userId, messageId);
    });

    it('should handle service errors', async () => {
      const messageId = 'message-uuid';

      messageService.remove.mockRejectedValue(new Error('Delete error'));

      await expect(controller.remove(messageId, mockActiveUser)).rejects.toThrow('Delete error');
      expect(messageService.remove).toHaveBeenCalledWith(mockActiveUser.userId, messageId);
    });

    it('should pass through all parameters correctly', async () => {
      const messageId = 'different-message-id';
      const differentUser: ActiveUserData = {
        userId: 'different-user-id',
        email: 'different@example.com',
      };

      messageService.remove.mockResolvedValue(undefined);

      await controller.remove(messageId, differentUser);

      expect(messageService.remove).toHaveBeenCalledWith(differentUser.userId, messageId);
    });

    it('should handle valid UUID message ID', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      messageService.remove.mockResolvedValue(undefined);

      await controller.remove(validUuid, mockActiveUser);

      expect(messageService.remove).toHaveBeenCalledWith(mockActiveUser.userId, validUuid);
    });

    it('should return void when successful', async () => {
      const messageId = 'message-uuid';

      messageService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(messageId, mockActiveUser);

      expect(result).toBeUndefined();
      expect(messageService.remove).toHaveBeenCalledWith(mockActiveUser.userId, messageId);
    });
  });

  describe('controller integration', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(typeof controller.create).toBe('function');
      expect(typeof controller.find).toBe('function');
      expect(typeof controller.update).toBe('function');
      expect(typeof controller.remove).toBe('function');
    });

    it('should maintain parameter order for all methods', async () => {
      // Create
      const createDto: CreateMessageDto = { content: 'Test', tagName: 'Tech' };
      messageService.create.mockResolvedValue(mockMessageResponse);
      await controller.create(createDto, mockActiveUser);
      expect(messageService.create).toHaveBeenCalledWith(mockActiveUser.userId, createDto);

      // Find
      const query: FindAllMessagesDto = { limit: 20 };
      messageService.findAll.mockResolvedValue(mockMessageList);
      await controller.find(query);
      expect(messageService.findAll).toHaveBeenCalledWith(query);

      // Update
      const updateDto: UpdateMessageDto = { content: 'Updated' };
      messageService.update.mockResolvedValue(undefined);
      await controller.update('message-id', updateDto, mockActiveUser);
      expect(messageService.update).toHaveBeenCalledWith(mockActiveUser.userId, 'message-id', updateDto);

      // Remove
      messageService.remove.mockResolvedValue(undefined);
      await controller.remove('message-id', mockActiveUser);
      expect(messageService.remove).toHaveBeenCalledWith(mockActiveUser.userId, 'message-id');
    });

    it('should handle different active user data structures', async () => {
      const minimalUser: ActiveUserData = {
        userId: 'minimal-user-id',
        email: 'minimal@example.com',
      };
      const createDto: CreateMessageDto = { content: 'Test', tagName: 'Tech' };

      messageService.create.mockResolvedValue(mockMessageResponse);

      await controller.create(createDto, minimalUser);

      expect(messageService.create).toHaveBeenCalledWith(minimalUser.userId, createDto);
    });
  });
});
