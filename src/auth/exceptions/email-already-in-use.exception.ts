import { ConflictException } from '@nestjs/common';
import { AuthExceptionsEnum } from '../enums/auth-exceptions.enum';

export class EmailAlreadyInUseException extends ConflictException {
  constructor() {
    super(AuthExceptionsEnum.EmailAlreadyInUse);
  }
}