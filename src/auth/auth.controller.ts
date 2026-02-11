import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@core/auth/decorators/public.decorator';
import { ActiveUser } from '@core/auth/decorators/active-user.decorator';
import type { ActiveUserDataWithRefreshToken } from '@core/auth/interfaces/active-user-data.interface';
import { BaseConfig } from '@core/config/configs/base.config';
import { JwtRefreshAuthGuard } from '@core/auth/guards/jwt-refresh-auth.guard';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@core/auth/auth.constants';
import type { Response } from 'express';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(BaseConfig.KEY)
    private readonly baseConfig: ConfigType<typeof BaseConfig>,
    private readonly authService: AuthService,
  ) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Public()
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken } = await this.authService.signUp(signUpDto);
    this.setCookies(response, accessToken, refreshToken);
  }

  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken } = await this.authService.signIn(signInDto);
    this.setCookies(response, accessToken, refreshToken);
  }

  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @ActiveUser() user: ActiveUserDataWithRefreshToken,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      user.userId,
      user.refreshToken,
    );

    this.setCookies(response, accessToken, refreshToken);
  }

  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @ActiveUser('userId') userId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(userId);

    response.clearCookie(ACCESS_TOKEN_COOKIE);
    response.clearCookie(REFRESH_TOKEN_COOKIE);
  }

  private setCookies(response: Response, accessToken: string, refreshToken: string) {
    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: this.baseConfig.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 1 * 60 * 60 * 1000,
    });

    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: this.baseConfig.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
