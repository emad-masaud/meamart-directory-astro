import { SignJWT, importPKCS8 } from 'jose';
import { PRODUCT_HEADERS, type ProductRow } from './schema';
import { nanoid } from 'nanoid';

// Environment variables (In Cloudflare, these would come from env)
// For local development, they should be in .env
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  // Format private key correctly if passed as single line string from env
  const formattedKey = privateKey.replace(/\\n/g, '\n');
  const key = await importPKCS8(formattedKey, 'RS256');

  const jwt = await new SignJWT({
    iss: clientEmail,
    scope: SCOPES.join(' '),
    aud: TOKEN_URL,
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(key);

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to get Google Access Token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

export class GoogleSheetsDatabase {
  private spreadsheetId: string;
  private clientEmail: string;
  private privateKey: string;

  constructor(spreadsheetId: string, clientEmail: string, privateKey: string) {
    this.spreadsheetId = spreadsheetId;
    this.clientEmail = clientEmail;
    this.privateKey = privateKey;
  }

  private async fetchAPI(endpoint: string, method: string = 'GET', body?: any) {
    const token = await getAccessToken(this.clientEmail, this.privateKey);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Google Sheets API Error: ${JSON.stringify(data)}`);
    }
    return data;
  }

  /**
   * Syncs the schema to the sheet. If row 1 doesn't match PRODUCT_HEADERS, it updates it.
   */
  async syncSchema(sheetName: string = 'Products') {
    const range = `${sheetName}!A1:Z1`;
    try {
      const data = await this.fetchAPI(`/values/${range}`);
      const headers = data.values?.[0] || [];
      
      const isMatch = PRODUCT_HEADERS.length === headers.length && 
                      PRODUCT_HEADERS.every((val, index) => val === headers[index]);
                      
      if (!isMatch) {
        // Overwrite header row
        await this.fetchAPI(`/values/${sheetName}!A1:AL1?valueInputOption=USER_ENTERED`, 'PUT', {
          values: [PRODUCT_HEADERS]
        });
      }
    } catch (error) {
      console.error("Error syncing schema:", error);
    }
  }

  /**
   * Fetches all products from the sheet.
   */
  async getProducts(sheetName: string = 'Products', filters?: Partial<ProductRow>): Promise<ProductRow[]> {
    const range = `${sheetName}!A1:AL`; // Cover all columns based on schema
    const data = await this.fetchAPI(`/values/${range}`);
    
    const rows = data.values || [];
    if (rows.length === 0) return [];

    const headers = rows[0] as string[];
    const items: ProductRow[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const item: any = {};
      
      headers.forEach((header, index) => {
        let value = row[index] || '';
        
        // Basic type casting
        if (['price', 'compare_at_price', 'stock_qty'].includes(header)) {
          value = value ? Number(value) : null;
        } else if (header === 'featured') {
          value = value.toLowerCase() === 'true';
        }
        item[header] = value;
      });

      // Apply branch/catalog filters if provided
      let matchesFilters = true;
      if (filters) {
        for (const [key, val] of Object.entries(filters)) {
          if (item[key] !== val) {
            matchesFilters = false;
            break;
          }
        }
      }

      if (matchesFilters && item.id) {
        items.push(item as ProductRow);
      }
    }

    return items;
  }

  /**
   * Adds a new product to the sheet.
   */
  async addProduct(product: Partial<ProductRow>, sheetName: string = 'Products'): Promise<ProductRow> {
    const now = new Date().toISOString();
    const newProduct: ProductRow = {
      ...product,
      id: product.id || nanoid(),
      created_at: now,
      updated_at: now,
    } as ProductRow;

    const rowData = PRODUCT_HEADERS.map(header => newProduct[header] ?? '');

    await this.fetchAPI(`/values/${sheetName}!A:A:append?valueInputOption=USER_ENTERED`, 'POST', {
      values: [rowData]
    });

    return newProduct;
  }

  /**
   * Updates an existing product by ID.
   */
  async updateProduct(id: string, updates: Partial<ProductRow>, sheetName: string = 'Products'): Promise<boolean> {
    const range = `${sheetName}!A1:AL`;
    const data = await this.fetchAPI(`/values/${range}`);
    const rows = data.values || [];
    
    if (rows.length <= 1) return false;
    
    const headers = rows[0] as string[];
    const idIndex = headers.indexOf('id');
    
    if (idIndex === -1) return false;

    // Find row index (1-based for Sheets API)
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idIndex] === id) {
        rowIndex = i + 1; // Google sheets is 1-indexed, so row[1] is row 2
        break;
      }
    }

    if (rowIndex === -1) return false;

    // Build updated row data
    const existingRow = rows[rowIndex - 2]; // 0-indexed offset
    updates.updated_at = new Date().toISOString();
    
    const rowData = headers.map((header, index) => {
      if (header in updates) {
        return (updates as any)[header] ?? '';
      }
      return existingRow[index] ?? '';
    });

    await this.fetchAPI(`/values/${sheetName}!A${rowIndex}:AL${rowIndex}?valueInputOption=USER_ENTERED`, 'PUT', {
      values: [rowData]
    });

    return true;
  }

  /**
   * Logs a QR scan event to the "Scans" sheet.
   */
  async logScan(scanData: {
    branch: string;
    campaign: string;
    source: string;
    ipCountry: string;
    userAgent: string;
    ipHash: string;
  }, sheetName: string = 'Scans'): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const rowData = [
        now,
        scanData.branch,
        scanData.campaign,
        scanData.source,
        scanData.ipCountry,
        scanData.userAgent,
        scanData.ipHash
      ];

      await this.fetchAPI(`/values/${sheetName}!A:G:append?valueInputOption=USER_ENTERED`, 'POST', {
        values: [rowData]
      });
      return true;
    } catch (error) {
      console.error("Error logging scan:", error);
      return false; // Fail silently for tracking
    }
  }
}
