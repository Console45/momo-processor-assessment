import { $Enums } from '@prisma/client';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-headerapikey';
import { DatabaseService } from 'src/modules/database/services/database.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class HeaderApiKeyStrategy extends PassportStrategy(
  Strategy,
  'api-key',
) {
  @Inject(DatabaseService)
  databaseService: DatabaseService;

  @Inject(AuthService)
  authService: AuthService;

  constructor() {
    super({ header: 'X-API-KEY', prefix: '' }, true, async (apiKey, done) => {
      return await this.validate(apiKey, done);
    });
  }

  public validate = async (
    apiKey: string,
    done: (error: Error, data) => void,
  ) => {
    const key = await this.databaseService.apiKey.findUnique({
      where: {
        key: this.authService.decrypt(apiKey),
        status: $Enums.ApikeyStatus.ACTIVE,
      },
      include: {
        client: true,
      },
    });
    if (!key) {
      return done(new UnauthorizedException(), null);
    }
    done(null, key);
  };
}
