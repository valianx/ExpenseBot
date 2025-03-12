import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { GoogleSheetsService } from './drive.service';
import { OpenAIService } from './openai.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    private configService: ConfigService,
    private googleSheetsService: GoogleSheetsService,
    private openAIService: OpenAIService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN') ?? '';
    this.bot = new Telegraf(token);
  }

  async onModuleInit() {
    this.bot.start((ctx) =>
      ctx.reply(
        '¡Hola! Soy tu asistente de gastos. Usa /gasto <monto> en <categoría>. Para ver el resumen mensual, usa /resumen.',
      ),
    );

    this.bot.command('gasto', (ctx) => {
      const message = ctx.message.text;
      const amount = parseFloat(message.split(' ')[1]);
      const user = ctx.from.first_name;

      if (!amount || isNaN(amount) || amount <= 0) {
        return ctx.reply('⚠️ El monto debe ser un número mayor a 0.');
      }

      const category = message.split(' en ')[1];

      this.handleExpenseCommand(ctx, amount, category, user);
    });

    this.bot.command('resumen', async (ctx) => {
      const cache = await this.cacheManager.get('resumen');
      if(cache){
        ctx.reply(String(cache));
        return;
      }
      await this.handleSummaryCommand(ctx);
    });

    this.bot.launch();
  }

  private async handleExpenseCommand(ctx, amount, category, user): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    await this.googleSheetsService.addExpenseToSheet(amount, category, date, user);
    ctx.reply(`✅ Gastaste $${amount} en ${category}.`);
  }

  private async handleSummaryCommand(ctx): Promise<void> {
    try {
      ctx.reply('📊 Generando resumen de gastos...');
  
      const sheetName = `${new Date().toISOString().substring(5, 7)}-${new Date().toISOString().substring(0, 4)}`;
      
      // 📌 Leer los datos directamente de Google Sheets
      const sheetData = await this.googleSheetsService.getSheetData(sheetName);
  
      if (!sheetData) {
        return ctx.reply('❌ No se encontraron datos en la hoja.');
      }
  
      // 📌 Enviar los datos a OpenAI
      const summary = await this.openAIService.generateSummaryFromText(sheetData);
  
      // 📌 Enviar el resumen al usuario
      this.cacheManager.set('resumen', `📊 Resumen mensual:\n\n${summary}`, 1000 * 60 * 60 * 24); // Guardar en caché por 24 horas
      ctx.reply(`📊 Resumen mensual:\n\n${summary}`);
    } catch (error) {
      console.error('❌ Error al generar el resumen:', error);
      ctx.reply('❌ Hubo un problema al generar el resumen.');
    }
  }
  
}
