import { registerAs, ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

const env = process.env;

export interface GlobalConfig {
  auth: {
    secretKey: string;
  };
  databaseUrl: string;
  paymentProviderKey: string;
  redisHost: string;
  redisPort: number;
  backendUrl: string;
}

const GlobalConfigSchema = Joi.object<GlobalConfig>({
  auth: Joi.object<GlobalConfig['auth']>({
    secretKey: Joi.string().required(),
  }),
  databaseUrl: Joi.string().required(),
  paymentProviderKey: Joi.string().required(),
  redisHost: Joi.string().required(),
  redisPort: Joi.number().required(),
  backendUrl: Joi.string().required(),
});

export const globalConfig = registerAs('global', () => {
  const config = {
    auth: {
      secretKey: env.SECRET_KEY,
    },
    databaseUrl: env.DATABASE_URL,
    paymentProviderKey: env.XYZ_API_KEY,
    redisHost: env.REDIS_HOST,
    redisPort:
      typeof env.REDIS_PORT === 'string'
        ? parseInt(env.REDIS_PORT)
        : env.REDIS_PORT,
    backendUrl: env.BACKEND_URL,
  } as GlobalConfig;
  const result = GlobalConfigSchema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });
  if (result.error) {
    console.error('GlobalConfig Validation errors:');
    for (const v of result.error.details) {
      console.error(v.message);
    }
    throw new Error('Missing configuration options');
  }
  return config;
});

export const globalConfigOptions: ConfigModuleOptions = {
  isGlobal: true,
  cache: true,
  load: [globalConfig],
};
