import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('Payment Processor API PLATFORM')
    .setDescription('Payment processing assessment')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors({
    origin: /.*/,
  });
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {}),
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.setGlobalPrefix('api/v1');
  await app.listen(4000);
}
bootstrap();
