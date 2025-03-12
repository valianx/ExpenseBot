import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { ConfigModule } from '@nestjs/config';
import { GoogleSheetsService } from './drive.service';
import { OpenAIService } from './openai.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [BotService, GoogleSheetsService, OpenAIService],
  controllers: [BotController],
})
export class BotModule {}
