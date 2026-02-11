import { UnauthorizedException } from '@nestjs/common';
import { AuthExceptionsEnum } from '../enums/auth-exceptions.enum';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super(AuthExceptionsEnum.InvalidCredentials);
  }
}
