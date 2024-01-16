import { ClientController } from './controller/client.controller';
import { Module } from '@nestjs/common';
import { ClientService } from './services/client.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ClientService],
  controllers: [ClientController],
})
export class ClientModule {}
