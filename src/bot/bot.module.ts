import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleSheetsService } from './drive.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
  providers: [BotService, GoogleSheetsService],
  controllers: [BotController],
})
export class BotModule {}
