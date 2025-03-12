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
        Los siguientes datos corresponden a gastos mensuales en Chile. 
        Analiza la información y genera un resumen con los siguientes puntos:
        
        1️⃣ **Resumen general**: Monto total gastado y las principales categorías de gasto.
        2️⃣ **Desglose por usuario**: Cuánto gastó cada usuario en total y en qué categorías.
        3️⃣ **Clasificación de importancia**: Marca cada categoría como "Importante" o "No Importante" según su relevancia en la vida cotidiana en Chile.
           - **Categorías siempre importantes en Chile**: 
             - **Alimentos** (Feria, Supermercado, Panadería).
             - **Transporte** (Bencina, Transporte Público, Metro, Micro, Colectivo).
             - **Vivienda** (Arriendo, Luz, Agua, Gas, Internet).
           - **Categorías posiblemente no importantes**: Juegos, Entretenimiento, Compras de lujo.
        4️⃣ **Formato claro y estructurado**, sin agregar recomendaciones ni consejos de ahorro.
  
        Datos de gastos en Chile:
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
  
      return response.choices[0].message.content?.trim() ?? 'No se pudo generar el resumen.';
    } catch (error) {
      console.error('❌ Error al generar resumen con OpenAI:', error);
      return '❌ No se pudo generar el resumen.';
    }
  }
  
  
}
