import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { DatabaseModule } from '../database/database.module';
import { MixedAuthGuard } from './guards';
import { HeaderApiKeyStrategy } from './strategies/apikey.strategy';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [DatabaseModule],
  providers: [AuthService, MixedAuthGuard, HeaderApiKeyStrategy],
  exports: [MixedAuthGuard, HeaderApiKeyStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
