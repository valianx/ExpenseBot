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
    user: string,
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
        range: `${sheetName}!A:D`,
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        return 'No hay datos disponibles.';
      }

      let totalGasto = 0;
      const categoriasTotales: Record<string, number> = {};
      const usuariosTotales: Record<string, number> = {};

      let formattedData = '';
      for (const row of rows.slice(1)) {
        const fecha = row[0] || 'Sin fecha';
        const monto = parseInt(row[1], 10) || 0;
        const categoria = row[2]?.toLowerCase() || 'Sin categoría';
        const usuario = row[3] || 'Desconocido';

        totalGasto += monto;
        categoriasTotales[categoria] =
          (categoriasTotales[categoria] || 0) + monto;
        usuariosTotales[usuario] = (usuariosTotales[usuario] || 0) + monto;
      }

      formattedData += `TOTAL_GASTO: ${totalGasto} CLP\n`;
      formattedData += `CATEGORIAS: ${JSON.stringify(categoriasTotales)}\n`;
      formattedData += `USUARIOS: ${JSON.stringify(usuariosTotales)}\n`;

      return formattedData;
    } catch (error) {
      console.error('❌ ERROR AL OBTENER DATOS DE GOOGLE SHEETS:', error);
      return '❌ NO SE PUDO OBTENER LA INFORMACIÓN.';
    }
  }
}
