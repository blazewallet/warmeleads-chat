// Real Google Sheets API Integration
import { type Lead } from './crmSystem';

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  range: string; // e.g., 'Leads!A1:K1000'
  apiKey?: string;
}

export interface SheetRow {
  [key: string]: string | number;
}

// Google Sheets API service
export class GoogleSheetsService {
  private apiKey: string;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
    
    if (!this.apiKey) {
      console.warn('⚠️ Google Sheets API key not configured. Set NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY environment variable.');
    }
  }

  // Read data from Google Sheets
  async readSheet(spreadsheetId: string, range: string = 'Sheet1!A1:K1000'): Promise<any[][]> {
    if (!this.apiKey) {
      throw new Error('Google Sheets API key not configured');
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${this.apiKey}`;
      
      console.log('🔄 Reading Google Sheet:', { 
        spreadsheetId: spreadsheetId.substring(0, 10) + '...', 
        range,
        apiKey: this.apiKey.substring(0, 10) + '...'
      });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Sheets API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: url.substring(0, 100) + '...' // Log partial URL for debugging
        });
        
        if (response.status === 400) {
          throw new Error('Ongeldige API key of spreadsheet configuratie. Controleer de Google Sheets API key en spreadsheet toegang.');
        } else if (response.status === 403) {
          throw new Error('Geen toegang tot spreadsheet. Zorg dat de sheet publiek toegankelijk is.');
        } else if (response.status === 404) {
          throw new Error('Spreadsheet niet gevonden. Controleer de URL.');
        } else {
          throw new Error(`Google Sheets API error: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      console.log('✅ Google Sheets data loaded:', {
        rows: data.values?.length || 0,
        columns: data.values?.[0]?.length || 0,
        firstRow: data.values?.[0] || 'No data'
      });

      return data.values || [];
    } catch (error) {
      console.error('Error reading Google Sheet:', error);
      throw error;
    }
  }

  // Convert sheet rows to Lead objects with branch-specific mapping
  parseLeadsFromSheet(rows: any[][], headerRow: number = 0): Lead[] {
    if (rows.length <= headerRow) {
      return [];
    }

    const headers = rows[headerRow].map(h => h.toString().toLowerCase().trim());
    const dataRows = rows.slice(headerRow + 1);
    
    console.log('📋 Sheet headers found:', headers);
    console.log('📋 Total columns in sheet:', headers.length);
    console.log('📋 Headers with index:', headers.map((h, i) => `${i}: "${h}"`));
    
    const leads: Lead[] = [];

    dataRows.forEach((row, index) => {
      if (row.length === 0 || !row[0]) return; // Skip empty rows
      
      try {
        console.log(`\n🔍 Parsing row ${index + headerRow + 2}:`, row);
        
        // Get all branch-specific values first
        const zonnepanelen = this.getCellValue(row, headers, ['zonnepanelen']);
        const dynamischContract = this.getCellValue(row, headers, ['dynamisch contract']);
        const stroomverbruik = this.getCellValue(row, headers, ['stroomverbruik']);
        const nieuwsbrief = this.getCellValue(row, headers, ['nieuwsbrief']);
        const redenThuisbatterij = this.getCellValue(row, headers, ['reden thuisbatterij']);
        const koopintentie = this.getCellValue(row, headers, ['koopintentie?', 'koopintentie']);
        
        // Build notes from available data if no specific notes column
        const existingNotes = this.getCellValue(row, headers, ['notities', 'notes', 'opmerkingen', 'extra']);
        let notes = existingNotes;
        
        // If there's a 14th column (extra data), add it to notes
        if (row.length > 13 && row[13]) {
          const extraData = row[13].toString().trim();
          notes = existingNotes ? `${existingNotes} | ${extraData}` : extraData;
        }

        // Basic lead data
        const lead: Lead = {
          id: `sheet_${index + headerRow + 1}`,
          name: this.getCellValue(row, headers, ['naam klant', 'naam', 'name', 'klant']) || 'Onbekend',
          email: this.getCellValue(row, headers, ['e-mail', 'email', 'mail']) || '',
          phone: this.getCellValue(row, headers, ['telefoonnummer', 'telefoon', 'phone', 'tel', 'mobiel']) || '',
          company: this.getCellValue(row, headers, ['bedrijf', 'company', 'organisatie']) || '',
          address: this.getCellValue(row, headers, ['adres', 'address', 'straat']) || '',
          city: this.getCellValue(row, headers, ['stad', 'city', 'plaats', 'woonplaats']) || '',
          interest: redenThuisbatterij || this.getCellValue(row, headers, ['interesse', 'interest', 'product', 'behoefte']) || 'Thuisbatterij',
          budget: this.getCellValue(row, headers, ['budget', 'prijs', 'investering']) || '',
          timeline: this.getCellValue(row, headers, ['timeline', 'wanneer', 'termijn', 'planning']) || '',
          notes: notes,
          status: this.parseStatus(this.getCellValue(row, headers, ['status', 'staat', 'fase'])),
          assignedTo: this.getCellValue(row, headers, ['toegewezen', 'assigned', 'verkoper']) || '',
          createdAt: this.parseDate(this.getCellValue(row, headers, ['datum interesse klant', 'datum', 'date', 'created'])) || new Date(),
          updatedAt: new Date(),
          source: 'import',
          sheetRowNumber: index + headerRow + 2, // +2 because sheets are 1-indexed and we skip header
          
          // Branch-specific data for Thuisbatterijen
          branchData: {
            datumInteresse: this.getCellValue(row, headers, ['datum interesse klant']),
            postcode: this.getCellValue(row, headers, ['postcode']),
            huisnummer: this.getCellValue(row, headers, ['huisnummer']),
            zonnepanelen: zonnepanelen,
            dynamischContract: dynamischContract,
            stroomverbruik: stroomverbruik,
            nieuwsbrief: nieuwsbrief,
            redenThuisbatterij: redenThuisbatterij,
            koopintentie: koopintentie
          }
        };
        
        console.log(`🔧 Lead ${lead.name} branch data:`, lead.branchData);
        console.log(`🔧 Raw values for ${lead.name}:`, {
          zonnepanelen: zonnepanelen,
          dynamischContract: dynamischContract,
          stroomverbruik: stroomverbruik,
          redenThuisbatterij: redenThuisbatterij,
          koopintentie: koopintentie,
          notes: notes
        });
        console.log(`🔧 Lead object has branchData:`, !!lead.branchData);
        console.log(`🔧 Full lead object for ${lead.name}:`, JSON.stringify(lead, null, 2));

        // Only add if we have at least name and email
        if (lead.name !== 'Onbekend' && lead.email) {
          leads.push(lead);
        }
      } catch (error) {
        console.error(`Error parsing row ${index + headerRow + 1}:`, error);
      }
    });

    console.log(`📊 Parsed ${leads.length} leads from ${dataRows.length} rows with branch-specific data`);
    return leads;
  }

  // Helper: Get cell value by column name variants
  private getCellValue(row: any[], headers: string[], columnNames: string[]): string {
    for (const columnName of columnNames) {
      // Try exact match first
      let index = headers.findIndex(h => h === columnName);
      
      // If no exact match, try includes (partial match)
      if (index === -1) {
        index = headers.findIndex(h => h.includes(columnName));
      }
      
      if (index !== -1 && row[index] !== undefined) {
        const value = row[index].toString().trim();
        if (value) {
          console.log(`✅ Found "${columnName}" in column ${index}: "${value}"`);
          return value;
        }
      }
    }
    
    // Debug: Log which columns we tried to find
    console.log(`❌ Could not find any of [${columnNames.join(', ')}] in headers:`, headers);
    return '';
  }

  // Helper: Parse status from sheet
  private parseStatus(statusText: string): Lead['status'] {
    const status = statusText.toLowerCase();
    
    if (status.includes('nieuw') || status.includes('new')) return 'new';
    if (status.includes('contact') || status.includes('gebeld')) return 'contacted';
    if (status.includes('gekwalificeerd') || status.includes('qualified') || status.includes('interesse')) return 'qualified';
    if (status.includes('geconverteerd') || status.includes('converted') || status.includes('verkocht') || status.includes('klant')) return 'converted';
    if (status.includes('verloren') || status.includes('lost') || status.includes('afgewezen')) return 'lost';
    
    return 'new'; // Default
  }

  // Helper: Parse date from sheet
  private parseDate(dateText: string): Date | null {
    if (!dateText) return null;
    
    try {
      // Try various date formats
      const date = new Date(dateText);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      // Try DD-MM-YYYY format
      const parts = dateText.split(/[-\/]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        
        if (year > 1900 && month >= 0 && month < 12 && day > 0 && day <= 31) {
          return new Date(year, month, day);
        }
      }
    } catch (error) {
      console.error('Error parsing date:', dateText, error);
    }
    
    return null;
  }

  // Write data back to Google Sheets
  async updateSheet(spreadsheetId: string, range: string, values: any[][]): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('Google Sheets API key not configured');
    }

    try {
      console.log('📝 Updating Google Sheet:', {
        spreadsheetId: spreadsheetId.substring(0, 10) + '...',
        range,
        rowsToUpdate: values.length,
        firstRowData: values[0]
      });

      // Use batchUpdate for better reliability
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED&key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          values: values,
          majorDimension: 'ROWS'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Sheets update error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          throw new Error('❌ GEEN WRITE TOEGANG: De huidige API key heeft alleen read permissies. Voor write access is een Service Account nodig.');
        } else if (response.status === 403) {
          throw new Error('❌ GEEN TOEGANG: Spreadsheet is niet publiek of API key heeft geen permissies.');
        } else if (response.status === 404) {
          throw new Error('❌ NIET GEVONDEN: Spreadsheet of range niet gevonden.');
        } else {
          throw new Error(`❌ API ERROR: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Google Sheets update successful:', data);
      return true;
      
    } catch (error) {
      console.error('Error updating Google Sheet:', error);
      throw error;
    }
  }

  // Append data to Google Sheets
  async appendToSheet(spreadsheetId: string, range: string, values: any[][]): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('Google Sheets API key not configured');
    }

    try {
      console.log('📝 Appending to Google Sheet:', {
        spreadsheetId: spreadsheetId.substring(0, 10) + '...',
        range,
        rowsToAppend: values.length,
        firstRowData: values[0]
      });

      // Use append API for adding new rows
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&key=${this.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          values: values,
          majorDimension: 'ROWS'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Sheets append error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          throw new Error('❌ GEEN WRITE TOEGANG: De huidige API key heeft alleen read permissies. Voor write access is een Service Account nodig.');
        } else if (response.status === 403) {
          throw new Error('❌ GEEN TOEGANG: Spreadsheet is niet publiek of API key heeft geen permissies.');
        } else if (response.status === 404) {
          throw new Error('❌ NIET GEVONDEN: Spreadsheet of range niet gevonden.');
        } else {
          throw new Error(`❌ API ERROR: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Google Sheets append successful:', data);
      return true;
      
    } catch (error) {
      console.error('Error appending to Google Sheet:', error);
      throw error;
    }
  }

  // Extract spreadsheet ID from URL
  static extractSpreadsheetId(url: string): string | null {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }

  // Validate if URL is a valid Google Sheets URL
  static isValidSheetsUrl(url: string): boolean {
    return url.includes('docs.google.com/spreadsheets') && this.extractSpreadsheetId(url) !== null;
  }
}

// Helper functions for easy use
export const readCustomerLeads = async (spreadsheetUrl: string, apiKey?: string): Promise<Lead[]> => {
  const service = new GoogleSheetsService(apiKey);
  const spreadsheetId = GoogleSheetsService.extractSpreadsheetId(spreadsheetUrl);
  
  if (!spreadsheetId) {
    throw new Error('Invalid Google Sheets URL');
  }

  console.log('📊 Reading customer leads from spreadsheet:', spreadsheetId.substring(0, 10) + '...');

  // Try different sheet names and ranges - extended to include all columns
  const possibleRanges = [
    'Sheet1!A1:P1000', // Extended to column P (16 columns)
    'Leads!A1:P1000', 
    'A1:P1000',
    'Sheet1!A:P',
    'Leads!A:P',
    'Sheet1!A1:K1000', // Fallback to original
    'A1:K1000'
  ];

  let rows: any[][] = [];
  let usedRange = '';

  for (const range of possibleRanges) {
    try {
      console.log(`🔍 Trying range: ${range}`);
      rows = await service.readSheet(spreadsheetId, range);
      if (rows.length > 0) {
        usedRange = range;
        console.log(`✅ Found data with range: ${range}`);
        break;
      }
    } catch (error) {
      console.log(`❌ Range ${range} failed:`, error instanceof Error ? error.message : 'Unknown error');
      
      // If it's a 400 error (API key issue), don't try other ranges
      if (error instanceof Error && error.message.includes('400')) {
        console.error('🚫 Google Sheets API key issue detected, stopping range attempts');
        throw error;
      }
      continue;
    }
  }

  if (rows.length === 0) {
    throw new Error('Geen data gevonden in spreadsheet. Controleer of de sheet data bevat en publiek toegankelijk is.');
  }
  
  // Parse to Lead objects
  const leads = service.parseLeadsFromSheet(rows);
  console.log(`📊 Successfully parsed ${leads.length} leads from range ${usedRange}`);
  
  return leads;
};

export const updateLeadInSheet = async (
  spreadsheetUrl: string, 
  lead: Lead, 
  apiKey?: string
): Promise<boolean> => {
  const service = new GoogleSheetsService(apiKey);
  const spreadsheetId = GoogleSheetsService.extractSpreadsheetId(spreadsheetUrl);
  
  if (!spreadsheetId || !lead.sheetRowNumber) {
    throw new Error('Invalid spreadsheet URL or missing row number');
  }

  console.log(`🔄 Updating lead ${lead.name} in Google Sheets row ${lead.sheetRowNumber}`);

  // Convert lead back to row format matching your spreadsheet columns:
  // 0: Naam Klant, 1: Datum Interesse Klant, 2: Postcode, 3: Huisnummer, 
  // 4: Telefoonnummer, 5: E-mail, 6: Zonnepanelen, 7: Dynamisch Contract,
  // 8: Stroomverbruik, 9: Budget, 10: Nieuwsbrief, 11: Reden Thuisbatterij, 12: Koopintentie?
  const rowData = [
    lead.name, // A - Naam Klant
    lead.branchData?.datumInteresse || '', // B - Datum Interesse Klant (niet aanpasbaar)
    lead.branchData?.postcode || '', // C - Postcode
    lead.branchData?.huisnummer || '', // D - Huisnummer
    lead.phone, // E - Telefoonnummer
    lead.email, // F - E-mail
    lead.branchData?.zonnepanelen || '', // G - Zonnepanelen
    lead.branchData?.dynamischContract || '', // H - Dynamisch Contract
    lead.branchData?.stroomverbruik || '', // I - Stroomverbruik
    lead.budget || '', // J - Budget
    lead.branchData?.nieuwsbrief || '', // K - Nieuwsbrief
    lead.branchData?.redenThuisbatterij || '', // L - Reden Thuisbatterij
    lead.branchData?.koopintentie || '', // M - Koopintentie?
    lead.notes || '' // N - Notities (14e kolom)
  ];

  console.log(`🔄 Row data for ${lead.name}:`, rowData);

  // Update the specific row - extended range to include all columns
  const range = `A${lead.sheetRowNumber}:N${lead.sheetRowNumber}`;
  
  try {
    const result = await service.updateSheet(spreadsheetId, range, [rowData]);
    console.log(`✅ Successfully updated ${lead.name} in Google Sheets`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update ${lead.name} in Google Sheets:`, error);
    throw error;
  }
};

// Add new lead to Google Sheets using update method (works with read-only API key)
export const addLeadToSheet = async (
  spreadsheetUrl: string, 
  lead: Lead, 
  apiKey?: string
): Promise<boolean> => {
  const service = new GoogleSheetsService(apiKey);
  const spreadsheetId = GoogleSheetsService.extractSpreadsheetId(spreadsheetUrl);
  
  if (!spreadsheetId) {
    throw new Error('Invalid spreadsheet URL');
  }

  console.log(`🔄 Adding new lead ${lead.name} to Google Sheets using update method`);

  try {
    // First, read the current data to find the next available row
    const currentData = await service.readSheet(spreadsheetId, 'A:N');
    
    if (currentData.length === 0) {
      throw new Error('Could not read current spreadsheet data');
    }

    // Find the next available row (after headers and existing data)
    const nextRowIndex = currentData.length + 1;
    const range = `A${nextRowIndex}:N${nextRowIndex}`;

    // Convert lead to row format matching your spreadsheet columns:
    // 0: Naam Klant, 1: Datum Interesse Klant, 2: Postcode, 3: Huisnummer, 
    // 4: Telefoonnummer, 5: E-mail, 6: Zonnepanelen, 7: Dynamisch Contract,
    // 8: Stroomverbruik, 9: Budget, 10: Nieuwsbrief, 11: Reden Thuisbatterij, 12: Koopintentie?
    const rowData = [
      lead.name, // A - Naam Klant
      new Date().toLocaleDateString('nl-NL'), // B - Datum Interesse Klant (huidige datum)
      lead.branchData?.postcode || '', // C - Postcode
      lead.branchData?.huisnummer || '', // D - Huisnummer
      lead.phone, // E - Telefoonnummer
      lead.email, // F - E-mail
      lead.branchData?.zonnepanelen || '', // G - Zonnepanelen
      lead.branchData?.dynamischContract || '', // H - Dynamisch Contract
      lead.branchData?.stroomverbruik || '', // I - Stroomverbruik
      lead.budget || '', // J - Budget
      lead.branchData?.nieuwsbrief || '', // K - Nieuwsbrief
      lead.branchData?.redenThuisbatterij || '', // L - Reden Thuisbatterij
      lead.branchData?.koopintentie || '', // M - Koopintentie?
      lead.notes || '' // N - Notities
    ];

    console.log(`🔄 Adding lead ${lead.name} to row ${nextRowIndex}:`, rowData);

    // Use update method instead of append (works with read-only API key)
    const result = await service.updateSheet(spreadsheetId, range, [rowData]);
    console.log(`✅ Successfully added ${lead.name} to Google Sheets at row ${nextRowIndex}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to add ${lead.name} to Google Sheets:`, error);
    throw error;
  }
};

// GoogleSheetsService is already exported above
