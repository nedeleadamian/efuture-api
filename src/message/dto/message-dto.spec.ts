import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { MessageNotFoundException } from '../exceptions/message-not-found.exception';
import { NotMessageAuthorException } from '../exceptions/not-message-author.exception';
import { MessageExceptionsEnum } from '../enums/message-exceptions.enum';
import { CreateMessageDto } from './create-message.dto';
import { UpdateMessageDto } from './update-message.dto';
import { FindAllMessagesDto } from './find-all-messages.dto';
import { MessageListDto } from './message-list.dto';
import { MessageResponseDto } from './message-response.dto';

describe('Message DTOs and Exceptions', () => {
  describe('CreateMessageDto', () => {
    it('should validate valid CreateMessageDto', async () => {
      const validDto = {
        content: 'This is a valid message',
        tagName: 'Tech',
      };

      const dto = plainToInstance(CreateMessageDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject empty content', async () => {
      const invalidDto = {
        content: '',
        tagName: 'Tech',
      };

      const dto = plainToInstance(CreateMessageDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject content longer than 240 characters', async () => {
      const invalidDto = {
        content: 'a'.repeat(241),
        tagName: 'Tech',
      };

      const dto = plainToInstance(CreateMessageDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should reject empty tagName', async () => {
      const invalidDto = {
        content: 'Valid message',
        tagName: '',
      };

      const dto = plainToInstance(CreateMessageDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should accept content exactly 240 characters', async () => {
      const validDto = {
        content: 'a'.repeat(240),
        tagName: 'Tech',
      };

      const dto = plainToInstance(CreateMessageDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject non-string content', async () => {
      const invalidDto = {
        content: 123,
        tagName: 'Tech',
      };

      const dto = plainToInstance(CreateMessageDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should reject non-string tagName', async () => {
      const invalidDto = {
        content: 'Valid message',
        tagName: 123,
      };

      const dto = plainToInstance(CreateMessageDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('UpdateMessageDto', () => {
    it('should accept partial updates with content only', async () => {
      const validDto = {
        content: 'Updated message',
      };

      const dto = plainToInstance(UpdateMessageDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept partial updates with tagName only', async () => {
      const validDto = {
        tagName: 'UpdatedTag',
      };

      const dto = plainToInstance(UpdateMessageDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept partial updates with both fields', async () => {
      const validDto = {
        content: 'Updated message',
        tagName: 'UpdatedTag',
      };

      const dto = plainToInstance(UpdateMessageDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept empty update DTO', async () => {
      const validDto = {};

      const dto = plainToInstance(UpdateMessageDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject invalid content when provided', async () => {
      const invalidDto = {
        content: '',
      };

      const dto = plainToInstance(UpdateMessageDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid tagName when provided', async () => {
      const invalidDto = {
        tagName: '',
      };

      const dto = plainToInstance(UpdateMessageDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('FindAllMessagesDto', () => {
    it('should accept valid query with all parameters', async () => {
      const validDto = {
        limit: 20,
        cursor: 'MjAyMy0xMC0yNlQxMDo0NTowMC4wMDBa',
        tagIds: ['550e8400-e29b-41d4-a716-446655440000'],
        authorIds: ['550e8400-e29b-41d4-a716-446655440001'],
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      };

      const dto = plainToInstance(FindAllMessagesDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept query with only required limit', async () => {
      const validDto = {
        limit: 10,
      };

      const dto = plainToInstance(FindAllMessagesDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject limit less than 1', async () => {
      const invalidDto = {
        limit: 0,
      };

      const dto = plainToInstance(FindAllMessagesDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should reject limit greater than 100', async () => {
      const invalidDto = {
        limit: 101,
      };

      const dto = plainToInstance(FindAllMessagesDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should reject invalid UUID in tagIds', async () => {
      const invalidDto = {
        limit: 20,
        tagIds: ['invalid-uuid'],
      };

      const dto = plainToInstance(FindAllMessagesDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid UUID in authorIds', async () => {
      const invalidDto = {
        limit: 20,
        authorIds: ['invalid-uuid'],
      };

      const dto = plainToInstance(FindAllMessagesDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid date format in startDate', async () => {
      const invalidDto = {
        limit: 20,
        startDate: 'invalid-date',
      };

      const dto = plainToInstance(FindAllMessagesDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('should reject invalid date format in endDate', async () => {
      const invalidDto = {
        limit: 20,
        endDate: 'invalid-date',
      };

      const dto = plainToInstance(FindAllMessagesDto, invalidDto);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('should transform string tagIds to array', async () => {
      const validDto = {
        limit: 20,
        tagIds: '550e8400-e29b-41d4-a716-446655440000',
      };

      const dto = plainToInstance(FindAllMessagesDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(Array.isArray(dto.tagIds)).toBe(true);
    });

    it('should transform string authorIds to array', async () => {
      const validDto = {
        limit: 20,
        authorIds: '550e8400-e29b-41d4-a716-446655440000',
      };

      const dto = plainToInstance(FindAllMessagesDto, validDto);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(Array.isArray(dto.authorIds)).toBe(true);
    });
  });

  describe('MessageResponseDto', () => {
    it('should create valid MessageResponseDto', () => {
      const validMessage = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Test message',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'test@example.com',
        },
        tag: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Tech',
        },
      };

      const dto = plainToInstance(MessageResponseDto, validMessage);

      expect(dto.id).toBe(validMessage.id);
      expect(dto.content).toBe(validMessage.content);
      expect(dto.author).toEqual(validMessage.author);
      expect(dto.tag).toEqual(validMessage.tag);
    });

    it('should handle null values correctly', () => {
      const messageWithNulls = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Test message',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: null,
        tag: null,
      };

      const dto = plainToInstance(MessageResponseDto, messageWithNulls);

      expect(dto.author).toBeNull();
      expect(dto.tag).toBeNull();
    });
  });

  describe('MessageListDto', () => {
    it('should create valid MessageListDto', () => {
      const validMessageList = {
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            content: 'Test message',
            createdAt: new Date(),
            updatedAt: new Date(),
            author: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              email: 'test@example.com',
            },
            tag: {
              id: '550e8400-e29b-41d4-a716-446655440002',
              name: 'Tech',
            },
          },
        ],
        meta: {
          nextCursor: null,
          hasNextPage: false,
        },
      };

      const dto = plainToInstance(MessageListDto, validMessageList);

      expect(dto.data).toHaveLength(1);
      expect(dto.data[0].content).toBe('Test message');
      expect(dto.meta.nextCursor).toBeNull();
      expect(dto.meta.hasNextPage).toBe(false);
    });

    it('should handle empty data array', () => {
      const emptyMessageList = {
        data: [],
        meta: {
          nextCursor: 'some-cursor',
          hasNextPage: true,
        },
      };

      const dto = plainToInstance(MessageListDto, emptyMessageList);

      expect(dto.data).toEqual([]);
      expect(dto.meta.nextCursor).toBe('some-cursor');
      expect(dto.meta.hasNextPage).toBe(true);
    });
  });

  describe('MessageNotFoundException', () => {
    it('should create MessageNotFoundException with correct message', () => {
      const exception = new MessageNotFoundException();

      expect(exception).toBeInstanceOf(Error);
      expect(exception.getStatus()).toBe(404);
      expect(exception.message).toBe(MessageExceptionsEnum.MessageNotFound);
    });

    it('should have correct response structure', () => {
      const exception = new MessageNotFoundException();
      const response = exception.getResponse();

      expect(response).toEqual({
        statusCode: 404,
        message: MessageExceptionsEnum.MessageNotFound,
        error: 'Not Found',
      });
    });
  });

  describe('NotMessageAuthorException', () => {
    it('should create NotMessageAuthorException with correct message', () => {
      const exception = new NotMessageAuthorException();

      expect(exception).toBeInstanceOf(Error);
      expect(exception.getStatus()).toBe(403);
      expect(exception.message).toBe(MessageExceptionsEnum.NotMessageAuthor);
    });

    it('should have correct response structure', () => {
      const exception = new NotMessageAuthorException();
      const response = exception.getResponse();

      expect(response).toEqual({
        statusCode: 403,
        message: MessageExceptionsEnum.NotMessageAuthor,
        error: 'Forbidden',
      });
    });
  });

  describe('MessageExceptionsEnum', () => {
    it('should have correct enum values', () => {
      expect(MessageExceptionsEnum.MessageNotFound).toBe('MESSAGE_NOT_FOUND');
      expect(MessageExceptionsEnum.NotMessageAuthor).toBe('NOT_MESSAGE_AUTHOR');
    });

    it('should have no additional properties', () => {
      const enumKeys = Object.keys(MessageExceptionsEnum);
      expect(enumKeys).toHaveLength(2);
      expect(enumKeys).toContain('MessageNotFound');
      expect(enumKeys).toContain('NotMessageAuthor');
    });
  });

  describe('DTO Integration Tests', () => {
    it('should handle nested validation correctly', async () => {
      const nestedDto = {
        limit: 20,
        message: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          content: 'Test message',
          createdAt: new Date(),
          updatedAt: new Date(),
          author: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            email: 'test@example.com',
          },
          tag: {
            id: '550e8400-e29b-41d4-a716-446655440002',
            name: 'Tech',
          },
        },
      };

      const queryDto = plainToInstance(FindAllMessagesDto, { limit: 20 });
      const messageDto = plainToInstance(MessageResponseDto, nestedDto.message);

      const queryErrors = await validate(queryDto);
      const messageErrors = await validate(messageDto, { forbidUnknownValues: false });

      expect(queryErrors).toHaveLength(0);
      expect(messageErrors).toHaveLength(0);
    });

    it('should handle transformation edge cases', async () => {
      const edgeCaseDto = {
        limit: '20',
        tagIds: 'uuid1,uuid2', // String that should be transformed to array
      };

      const dto = plainToInstance(FindAllMessagesDto, edgeCaseDto);
      await validate(dto);

      expect(dto.limit).toBe(20);
      expect(Array.isArray(dto.tagIds)).toBe(true);
    });
  });
});
