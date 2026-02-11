import { UnauthorizedException } from '@nestjs/common';
import { AuthExceptionsEnum } from '../enums/auth-exceptions.enum';

export class InvalidTokenException extends UnauthorizedException {
  constructor() {
    super(AuthExceptionsEnum.InvalidToken);
  }
}