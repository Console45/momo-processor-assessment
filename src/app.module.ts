import { RequestContextModule } from '@medibloc/nestjs-request-context';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { globalConfig } from './config';
import { AppRequestContext } from './utils';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [globalConfig],
    }),
    RequestContextModule.forRoot({
      isGlobal: true,
      contextClass: AppRequestContext,
    }),
    DatabaseModule,
  ],
})
export class AppModule {}
