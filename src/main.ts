import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { execSync } from 'child_process';

async function bootstrap() {
  try {
    execSync('git submodule init');
    execSync('git submodule update');
  } catch {
    console.error('Failed to initialize submodules');
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3003);
}
void bootstrap();
