import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
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

  constructor(private readonly configService: ConfigService) {
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
