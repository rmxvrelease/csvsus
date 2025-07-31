import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaClient } from '../generated/prisma/client';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaClient],
})
export class AppModule {}
