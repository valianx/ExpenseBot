import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  async generateSummaryFromText(sheetData: string): Promise<string> {
    try {
      const prompt = `
        Analiza los siguientes datos de gastos mensuales y genera un resumen conciso con las principales categorías de gasto y sus montos.
        No incluyas recomendaciones, tendencias ni sugerencias de ahorro. Solo responde con los datos resumidos en formato claro.
        
        Datos:
        ${sheetData}
      `;
  
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un analista financiero que presenta datos resumidos sin hacer recomendaciones.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
      });
  
      return response.choices[0].message.content?.trim() ?? 'No se pudo generar el resumen.';
    } catch (error) {
      console.error('❌ Error al generar resumen con OpenAI:', error);
      return '❌ No se pudo generar el resumen.';
    }
  }
}
