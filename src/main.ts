import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from './core/transform.interceptor';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser'
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  const port = configService.get('PORT');
  await app.listen(port ?? 3000);
}
bootstrap();
