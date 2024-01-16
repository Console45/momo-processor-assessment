declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE: 'postgres';
    DATABASE_URL: string;
    NODE_ENV: string = 'development';
    PRIVATE_KEY: string;
    PORT: number | string;
  }
}
