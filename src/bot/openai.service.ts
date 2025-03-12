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
        ANALIZA LA INFORMACIÓN Y GENERA UN RESUMEN ESTRUCTURADO EN EL SIGUIENTE ORDEN:
  
        📊 1️⃣ CLASIFICACIÓN DE IMPORTANCIA  
           1.1 ✅ GASTOS IMPORTANTES  
               🏠 Vivienda: Arriendo, Luz, Agua, Gas, Internet  
               🚗 Transporte: Bencina, Crédito Auto, Permiso de Circulación  
               🍞 Alimentación: Feria, Supermercado, Panadería  
               ⚡ Servicios Básicos: Luz, Agua, Internet, Gas  
               📄 Impuestos y Seguros: Permiso de Circulación, SOAP  
           1.2 ⚠️ GASTOS NO IMPORTANTES  
               🎮 Ocio: Juegos, Entretenimiento, Compras innecesarias  
  
        👤 2️⃣ DESGLOSE POR USUARIO  
           2.1 💰 TOTAL GASTADO POR CADA USUARIO  
           2.2 📌 CATEGORÍAS EN LAS QUE CADA USUARIO GASTÓ  
  
        💰 3️⃣ RESUMEN GENERAL  
           3.1 🔹 MONTO TOTAL GASTADO  
           3.2 🔸 PRINCIPALES CATEGORÍAS DE GASTO  
  
        📌 📊 **CALCULA LOS TOTALES CON PRECISIÓN Y RESPETA EL FORMATO**  
        📌 SOLO DEVUELVE LOS PUNTOS INDICADOS, NO AGREGUES RECOMENDACIONES.
  
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
  
      return response.choices[0].message.content?.trim() ?? 'NO SE PUDO GENERAR EL RESUMEN.';
    } catch (error) {
      console.error('ERROR AL GENERAR RESUMEN CON OPENAI:', error);
      return 'NO SE PUDO GENERAR EL RESUMEN.';
    }
  }
  
}
