import { ClientController } from './controller/client.controller';
import { Module } from '@nestjs/common';
import { ClientService } from './services/client.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [ClientService],
  controllers: [ClientController],
})
export class ClientModule {}
