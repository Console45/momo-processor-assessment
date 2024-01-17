import { RequestContextModule } from '@medibloc/nestjs-request-context';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { globalConfig } from './config';
import { AppRequestContext } from './utils';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientModule } from './modules/client/client.module';
import { BullModule } from '@nestjs/bull';
import { PaymentProcessModule } from './modules/payment-processor/payment-processor.module';

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
    AuthModule,
    ClientModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    PaymentProcessModule,
  ],
})
export class AppModule {}
