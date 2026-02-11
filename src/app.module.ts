import { Module } from '@nestjs/common';
import { CoreModule } from '@core/core.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './message/message.module';

const FeatureModules = [AuthModule, UserModule, MessageModule];

@Module({
  imports: [CoreModule, ...FeatureModules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
