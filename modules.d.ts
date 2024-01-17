declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE: 'postgres';
    DATABASE_URL: string;
    NODE_ENV: string = 'development';
    SECRET_KEY: string;
    PORT: number | string;
    XYZ_API_KEY: string;
    REDIS_HOST: string;
    REDIS_PORT: number | string;
    BACKEND_URL: string;
  }
}
