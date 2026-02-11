import { NotFoundException } from '@nestjs/common';
import { UserExceptionsEnum } from '../enums/user-exceptions.enum';

export class RoleNotFoundException extends NotFoundException {
  constructor() {
    super(UserExceptionsEnum.RolerNotFound);
  }
}
