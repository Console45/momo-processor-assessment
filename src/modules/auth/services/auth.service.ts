import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/services/database.service';
import { CreateClientDto } from '../dtos/auth.dto';
import { generateApiKey } from 'generate-api-key';
import { ApikeyStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { GlobalConfig, globalConfig } from 'src/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires

@Injectable()
export class AuthService {
  @Inject(DatabaseService)
  databaseService: DatabaseService;
  @Inject(globalConfig.KEY)
  config: GlobalConfig;

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
            key: generateApiKey({
              method: 'uuidv4',
              dashes: false,
              name: data.name,
            }) as string,
          },
        },
      },
      include: {
        apiKeys: {
          where: {
            status: ApikeyStatus.ACTIVE,
          },
          select: {
            key: true,
          },
        },
      },
    });

    client.apiKeys = client?.apiKeys?.map((apiKey) => ({
      key: this.encryptKey(apiKey.key),
    }));
    return client;
  }

  encryptKey(text: string) {
    try {
      const iv = crypto.randomBytes(16);
      const key = crypto
        .createHash('sha256')
        .update(this.config.auth.secretKey)
        .digest('base64')
        .substr(0, 32);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
      console.log(error);
    }
  }
  decrypt(encryptedText: string) {
    try {
      const textParts = encryptedText.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');

      const encryptedData = Buffer.from(textParts.join(':'), 'hex');
      const key = crypto
        .createHash('sha256')
        .update(this.config.auth.secretKey)
        .digest('base64')
        .substr(0, 32);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

      const decrypted = decipher.update(encryptedData);
      const decryptedText = Buffer.concat([decrypted, decipher.final()]);
      return decryptedText.toString();
    } catch (error) {
      console.log(error);
    }
  }
}
