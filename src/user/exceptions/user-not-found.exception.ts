import { NotFoundException } from '@nestjs/common';
import { UserExceptionsEnum } from '../enums/user-exceptions.enum';

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super(UserExceptionsEnum.UserNotFound);
  }
}
