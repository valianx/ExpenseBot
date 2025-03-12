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
               - IMPUESTOS Y SEGUROS: PERMISO DE CIRCULACIÓN, SOAP  
           3.2 CATEGORÍAS NO IMPORTANTES  
               - JUEGOS, ENTRETENIMIENTO, COMPRAS DE LUJO  

        📌 **NO INCLUYAS PUNTO 4️⃣ NI RECOMENDACIONES**. SOLO DEVUELVE EL RESUMEN DE LOS PUNTOS 1️⃣, 2️⃣ Y 3️⃣.  Tamaño  de fuente del punto 1 un poco mas grande que lo demás.

        📊 DATOS DE GASTOS EN CHILE:  
        ${sheetData}
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un analista financiero especializado en Chile. Clasifica y resume los gastos con precisión cultural sin hacer recomendaciones.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
      });

      return response.choices[0].message.content?.trim() ?? '❌ NO SE PUDO GENERAR EL RESUMEN.';
    } catch (error) {
      console.error('❌ ERROR AL GENERAR RESUMEN CON OPENAI:', error);
      return '❌ NO SE PUDO GENERAR EL RESUMEN.';
    }
  }
}
