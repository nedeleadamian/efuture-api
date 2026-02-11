import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ActiveUser } from '@core/auth/decorators/active-user.decorator';
import { type ActiveUserData } from '@core/auth/interfaces/active-user-data.interface';
import { Public } from '@core/auth/decorators/public.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageService } from './message.service';
import { FindAllMessagesDto } from './dto/find-all-messages.dto';
import { MessageListDto } from './dto/message-list.dto';

@ApiTags('Messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new short message' })
  @ApiResponse({ status: 201, description: 'The message has been successfully posted.' })
  @ApiResponse({ status: 400, description: 'Validation failed (e.g. content too long).' })
  create(@Body() dto: CreateMessageDto, @ActiveUser() activeUser: ActiveUserData) {
    return this.messageService.create(activeUser.userId, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get messages with cursor pagination and filters' })
  @ApiResponse({
    status: 200,
    type: MessageListDto,
    description: 'Returns a paginated list of messages.',
  })
  find(@Query() query: FindAllMessagesDto): Promise<MessageListDto> {
    return this.messageService.findAll(query);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a message (Author only)' })
  @ApiResponse({ status: 200, description: 'The message has been updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You can only edit your own messages.' })
  update(
    @Param('id', new ParseUUIDPipe()) messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.messageService.update(activeUser.userId, messageId, updateMessageDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a message (Author only)' })
  @ApiResponse({ status: 204, description: 'The message has been deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You can only delete your own messages.' })
  remove(
    @Param('id', new ParseUUIDPipe()) messageId: string,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.messageService.remove(activeUser.userId, messageId);
  }
}
