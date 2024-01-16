import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/services/database.service';
import { CreateClientDto } from '../dtos/auth.dto';
import { generateApiKey } from 'generate-api-key';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Cryptr = require('cryptr');

@Injectable()
export class AuthService {
  @Inject(DatabaseService)
  databaseService: DatabaseService;

  private readonly cryptr = new Cryptr(process.env.SECRET_KEY);

  async createClient(data: CreateClientDto) {
    const existingClient = await this.databaseService.client.findUnique({
      where: {
        name: data.name,
      },
    });
    if (existingClient) {
      throw new ConflictException('Client application already exists');
    }
    const client = await this.databaseService.client.create({
      data: {
        ...data,
        apiKeys: {
          create: {
            key: this.cryptr.encrypt(
              generateApiKey({
                method: 'uuidv4',
                dashes: false,
                name: data.name,
              }),
            ),
          },
        },
      },
    });
    return client;
  }
}
