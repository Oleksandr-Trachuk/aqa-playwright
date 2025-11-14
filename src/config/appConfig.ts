import * as dotenv from 'dotenv';
dotenv.config();

export const appConfig = {
  baseUrl: process.env.BASE_URL ?? 'https://qauto.forstudy.space',

  httpCredentials:
    process.env.HTTP_USERNAME && process.env.HTTP_PASSWORD
      ? {
          username: process.env.HTTP_USERNAME!,
          password: process.env.HTTP_PASSWORD!,
        }
      : undefined,
};