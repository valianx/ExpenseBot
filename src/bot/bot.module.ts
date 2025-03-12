import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotRepository } from './repository/bot.repository';
import { Expense } from './entity/Expense';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT ?? 5432),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: process.env.DATABASE_SYNCHRONIZE == 'true',
    }),
    TypeOrmModule.forFeature([Expense]),
  ],
  providers: [BotService, BotRepository],
  controllers: [BotController],
})
export class BotModule {}
