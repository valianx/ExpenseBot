import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

@Injectable()
export class GoogleSheetsService {
  private sheets: any;
  private readonly spreadsheetId = process.env.GOOGLE_SHEET_ID;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async getSheetNames(): Promise<string[]> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });

    return response.data.sheets.map((sheet) => sheet.properties.title);
  }

  async createSheetIfNotExists(sheetName: string): Promise<void> {
    const sheetNames = await this.getSheetNames();

    if (sheetNames.includes(sheetName)) {
      console.log(`⚠️ La hoja "${sheetName}" ya existe`);
      return;
    }

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: sheetName },
            },
          },
        ],
      },
    });

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A1:C1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Fecha', 'Monto', 'Categoría', 'Usuario']],
      },
    });
  }

  async addExpenseToSheet(
    amount: number,
    category: string,
    date: string,
    user:string
  ): Promise<void> {
    const sheetName = `${date.substring(5, 7)}-${date.substring(0, 4)}`;
    await this.createSheetIfNotExists(sheetName);

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:C`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[date, amount, category, user]],
      },
    });

    console.log(
      `Gasto de $${amount} en "${category}" agregado en la hoja "${sheetName}".`,
    );
  }
  async getSheetData(sheetName: string): Promise<string> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:D`, // 🔹 Ahora incluye la columna D (Usuario)
      });
  
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return 'No hay datos en la hoja.';
      }
  
      let formattedData = 'Resumen de gastos:\n\n';
      formattedData += 'Fecha | Monto | Categoría | Usuario\n';
      formattedData += '-------------------------------------------\n';
      
      rows.slice(1).forEach((row) => {
        const date = row[0] || 'Sin fecha';
        const amount = row[1] || '0';
        const category = row[2] || 'Sin categoría';
        const user = row[3] || 'Desconocido';
  
        formattedData += `${date} | ${amount} | ${category} | ${user}\n`;
      });
  
      return formattedData;
    } catch (error) {
      console.error('❌ Error al leer los datos de Google Sheets:', error);
      return '❌ No se pudo obtener la información.';
    }
  }
  
  
}
