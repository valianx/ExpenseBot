import { Injectable } from '@nestjs/common';
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
        LOS SIGUIENTES DATOS CORRESPONDEN A GASTOS MENSUALES EN CHILE.
        ANALIZA LA INFORMACIÓN Y GENERA UN RESUMEN ESTRUCTURADO DE LA SIGUIENTE FORMA:
        
        1️⃣ RESUMEN GENERAL  
           1.1 MONTO TOTAL GASTADO  
           1.2 PRINCIPALES CATEGORÍAS DE GASTO  

        2️⃣ DESGLOSE POR USUARIO  
           2.1 TOTAL GASTADO POR CADA USUARIO  
           2.2 CATEGORÍAS EN LAS QUE CADA USUARIO GASTÓ  

        3️⃣ CLASIFICACIÓN DE IMPORTANCIA  
           3.1 CATEGORÍAS IMPORTANTES EN CHILE  
               - ALIMENTOS: FERIA, SUPERMERCADO, PANADERÍA  
               - TRANSPORTE: BENCINA, TRANSPORTE PÚBLICO, METRO, MICRO, COLECTIVO  
               - VIVIENDA: ARRIENDO, LUZ, AGUA, GAS, INTERNET  
           3.2 CATEGORÍAS NO IMPORTANTES  
               - JUEGOS, ENTRETENIMIENTO, COMPRAS DE LUJO  

        4️⃣ FORMATO CLARO Y ESTRUCTURADO  
           4.1 NO INCLUYAS RECOMENDACIONES NI CONSEJOS DE AHORRO  
           4.2 SOLO DEVUELVE EL RESUMEN EN FORMATO LIMPIO  
        
        📊 DATOS DE GASTOS EN CHILE:  
        ${sheetData}
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Eres un analista financiero especializado en Chile. Clasifica y resume los gastos con precisión cultural sin hacer recomendaciones.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
      });

      return (
        response.choices[0].message.content?.trim() ??
        '❌ NO SE PUDO GENERAR EL RESUMEN.'
      );
    } catch (error) {
      console.error('❌ ERROR AL GENERAR RESUMEN CON OPENAI:', error);
      return '❌ NO SE PUDO GENERAR EL RESUMEN.';
    }
  }
}
