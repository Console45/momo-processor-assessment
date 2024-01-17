import { RequestContextModule } from '@medibloc/nestjs-request-context';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { globalConfig } from './config';
import { AppRequestContext } from './utils';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientModule } from './modules/client/client.module';
import { BullModule } from '@nestjs/bull';
import { PaymentProcessModule } from './modules/payment-processor/payment-processor.module';
import { SharedModule } from './modules/shared/shared.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
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
    BullModule.registerQueueAsync({
      inject: [globalConfig.KEY],
      useFactory: async (cfg: ConfigType<typeof globalConfig>) => ({
        redis: {
          host: cfg.redisHost,
          port: cfg.redisPort,
        },
      }),
    }),
    PaymentProcessModule,
    SharedModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
