import { NotFoundException } from '@nestjs/common';
import { MessageExceptionsEnum } from '../enums/message-exceptions.enum';

export class MessageNotFoundException extends NotFoundException {
  constructor() {
    super(MessageExceptionsEnum.MessageNotFound);
  }
}
