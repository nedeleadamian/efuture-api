import { ForbiddenException } from '@nestjs/common';
import { MessageExceptionsEnum } from '../enums/message-exceptions.enum';

export class NotMessageAuthorException extends ForbiddenException {
  constructor() {
    super(MessageExceptionsEnum.NotMessageAuthor);
  }
}
