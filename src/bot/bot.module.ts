import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { ConfigModule } from '@nestjs/config';
import { GoogleSheetsService } from './drive.service';
import { OpenAIService } from './openai.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [ConfigModule.forRoot(), CacheModule.register()],
  providers: [BotService, GoogleSheetsService, OpenAIService],
  controllers: [BotController],
})
export class BotModule {}
