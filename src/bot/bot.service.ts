import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { GoogleSheetsService } from './drive.service';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    private configService: ConfigService,
    private googleSheetsService: GoogleSheetsService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN') ?? '';
    this.bot = new Telegraf(token);
  }

  async onModuleInit() {
    this.bot.start((ctx) =>
      ctx.reply(
        '¡Hola! Soy tu asistente de gastos. Usa /gasto <monto> en <categoría>.',
      ),
    );

    this.bot.command('gasto', (ctx) => {
      const message = ctx.message.text;
      const regex = /^\/gasto (\d+(\.\d{1,2})?) en ([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)$/;

      const match = message.match(regex);
      if (!match) {
        return ctx.reply(
          '⚠️ Uso correcto: /gasto <monto> en <categoría>\nEjemplo: /gasto 5000 en comida',
        );
      }
      const amount = parseFloat(message.split(' ')[1]);

      if (!amount || isNaN(amount) || amount <= 0) {
        return ctx.reply('⚠️ El monto debe ser un número mayor a 0.');
      }

      const category = match[3];

      this.handleExpenseCommand(ctx, amount, category);
    });

    this.bot.launch();
  }
  private async handleExpenseCommand(ctx, amount, category): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    await this.googleSheetsService.addExpenseToSheet(amount, category, date);
    ctx.reply(`✅ Gastaste $${amount} en ${category}.`);
  }
}
