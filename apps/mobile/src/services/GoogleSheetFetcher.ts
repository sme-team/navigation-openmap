// file: src/services/GoogleSheetFetcher.ts
import { defaultAxios, handleAxiosError} from './axiosConfig';
import * as XLSX from 'xlsx';

// Interface cho input params
interface FetchOptions {
  link: string; // URL Google Sheets public
  sheets?: string[]; // Mảng tên sheets cụ thể (optional)
  timeout?: number; // Timeout cho request (ms)
  retries?: number; // Số lần retry khi fail
}

// Interface cho output data của một sheet
interface SheetData {
  [key: string]: any; // Object động dựa trên headers
}

// Interface cho kết quả tổng thể
interface FetchResult {
  success: boolean;
  sheetId: string;
  totalSheets: number;
  data: { [sheetName: string]: SheetData[] };
  summary: { [sheetName: string]: number };
  timestamp: string;
  error?: string; // Optional cho lỗi
}

// Interface cho progress callback
interface ProgressCallback {
  (progress: { loaded: number; total: number; percent: number }): void;
}

class GoogleSheetFetcher {
  private readonly defaultTimeout: number = 30000; // 30s
  private readonly defaultRetries: number = 3;

  

  // Method private: Trích xuất Sheet ID từ URL (pure function)
  private extractSheetId(url: string): string {
    // Support nhiều format URL của Google Sheets
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /docs\.google\.com\/.*\/([a-zA-Z0-9-_]{20,})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    throw new Error('Invalid Google Sheets URL. Please provide a valid public Google Sheets link.');
  }

  // Method private: Tải file XLSX từ Google Sheets với retry logic
  private async downloadExcelFile(
    sheetId: string, 
    timeout: number = this.defaultTimeout,
    retries: number = this.defaultRetries,
    onProgress?: ProgressCallback
  ): Promise<ArrayBuffer> {
    const downloadUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
    
    let lastError: Error;
    // Clone axios instance để customize responseType
    const axiosInstance = defaultAxios; // Sử dụng instance chung
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
    
        const response = await axiosInstance.get(downloadUrl, {
          responseType: 'arraybuffer', // Customize ở đây
          timeout,
          onDownloadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress({ loaded: progressEvent.loaded, total: progressEvent.total, percent });
            }
          },
        });

        // Kiểm tra response validity
        if (!response.data || response.data.byteLength === 0) {
          throw new Error('Downloaded file is empty');
        }

        // Kiểm tra content type nếu có
        const contentType = response.headers['content-type'];
        if (contentType && !contentType.includes('spreadsheet') && !contentType.includes('excel')) { 
        }
        return response.data;

      } catch (error) {
        lastError = error as Error;
        const standardizedError = handleAxiosError(error); // Chuẩn hóa lỗi

        // Nếu không phải lần cuối, đợi trước khi retry
        if (attempt < retries) {
          // const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          // await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    // throw handleAxiosError(lastError); // Throw lỗi chuẩn hóa
    throw new Error(`Failed to download after ${retries} attempts. Last error: ${lastError!.message}`);
  }

  // Method private: Validate và clean headers
  private cleanHeaders(headers: any[]): string[] {
    return headers.map((header, index) => {
      if (header == null || header === '') {
        return `Column_${index + 1}`;
      }
      
      const cleanHeader = String(header).trim()
        .replace(/[\n\r\t]/g, ' ') // Replace line breaks with spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/[^\w\s-_.]/g, ''); // Remove special characters except common ones
        
      return cleanHeader || `Column_${index + 1}`;
    });
  }

  // Method private: Xử lý dữ liệu từ một sheet (optimized)
  private processSheetData(worksheet: XLSX.WorkSheet, sheetName: string): SheetData[] {
    try {
      // Sử dụng range để tối ưu performance
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      // Chuyển worksheet thành mảng 2D với range specific
      const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '', // Sử dụng empty string thay vì null để dễ xử lý
        raw: false,
        range: range // Sử dụng range để tối ưu
      });

      if (rawData.length === 0) {
        return [];
      }

      // Tìm header row (có thể không phải row đầu tiên)
      let headerRowIndex = 0;
      let headers: string[] = [];

      for (let i = 0; i < Math.min(5, rawData.length); i++) {
        const row = rawData[i];
        if (!row || row.length === 0) continue;

        // Check if this row looks like headers
        const nonEmptyCount = row.filter(cell => String(cell || '').trim() !== '').length;
        if (nonEmptyCount >= 2) { // At least 2 non-empty columns
          headers = this.cleanHeaders(row);
          headerRowIndex = i;
          break;
        }
      }

      if (headers.length === 0) {
        return [];
      }

      // Tìm data start index
      let dataStartIndex = headerRowIndex + 1;
      
      // Skip meta rows sau headers
      for (let i = dataStartIndex; i < Math.min(dataStartIndex + 10, rawData.length); i++) {
        const row = rawData[i];
        if (!row || row.length === 0) {
          dataStartIndex = i + 1;
          continue;
        }

        const firstValue = String(row[0] || '').trim().toLowerCase();
        const metaKeywords = [
          'length', 'description', 'constraint', 'constraints',
          'type', 'format', 'validation', 'rule', 'example',
          'note', 'remark', 'comment'
        ];

        if (metaKeywords.some(keyword => firstValue.includes(keyword))) {
          dataStartIndex = i + 1;
          continue;
        }

        // Nếu row có data thực, dừng việc skip
        const hasRealData = row.some((cell, index) => 
          index > 0 && String(cell || '').trim() !== ''
        );
        
        if (hasRealData) {
          dataStartIndex = i;
          break;
        }
        
        dataStartIndex = i + 1;
      }

      // Process data rows
      const jsonData: SheetData[] = [];
      const headerCount = headers.length;

      for (let i = dataStartIndex; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || row.length === 0) continue;

        // Check if row has meaningful data
        const hasData = row.some(cell => {
          const value = String(cell || '').trim();
          return value !== '' && value !== '0' && value !== 'null' && value !== 'undefined';
        });
        
        if (!hasData) continue;

        // Build row object
        const rowObject: SheetData = {};
        let hasValidData = false;

        for (let j = 0; j < headerCount; j++) {
          const header = headers[j];
          if (!header || header.trim() === '') continue;

          const cellValue = j < row.length ? row[j] : '';
          
          // Process cell value
          let processedValue: any = cellValue;
          if (cellValue != null && cellValue !== '') {
            const stringValue = String(cellValue).trim();
            
            // Try to convert numbers
            if (/^\d+$/.test(stringValue)) {
              processedValue = parseInt(stringValue, 10);
            } else if (/^\d*\.\d+$/.test(stringValue)) {
              processedValue = parseFloat(stringValue);
            } else {
              processedValue = stringValue;
            }
            
            if (processedValue !== '') {
              hasValidData = true;
            }
          } else {
            processedValue = null;
          }

          rowObject[header] = processedValue;
        }

        if (hasValidData) {
          jsonData.push(rowObject);
        }
      }

      return jsonData;

    } catch (error) {
      return [];
    }
  }

  // Method public: Fetch specific sheets
  public async fetchSheets(options: FetchOptions, onProgress?: ProgressCallback): Promise<FetchResult> {
    const startTime = Date.now();

    
    try {
      // Validate input
      if (!options.link || typeof options.link !== 'string') {
        throw new Error('Invalid link provided');
      }

      const sheetId = this.extractSheetId(options.link);
      const timeout = options.timeout || this.defaultTimeout;
      const retries = options.retries || this.defaultRetries;

      // Download Excel file
      const excelBuffer = await this.downloadExcelFile(sheetId, timeout, retries, onProgress);
      
      // Read workbook
      const workbook = XLSX.read(excelBuffer, { 
        type: 'array',
        cellDates: true, // Auto parse dates
        cellNF: false, // Don't format numbers
        cellText: false // Don't convert to text
      });

      const availableSheets = workbook.SheetNames;
      if (availableSheets.length === 0) {
        throw new Error('No sheets found in the workbook');
      }

      // Determine which sheets to process
      const sheetsToProcess = options.sheets && options.sheets.length > 0 
        ? options.sheets.filter(sheet => availableSheets.includes(sheet))
        : availableSheets;

      if (sheetsToProcess.length === 0) {
        throw new Error('No valid sheets found to process');
      }
      // Process each sheet
      const result: { [sheetName: string]: SheetData[] } = {};
      
      for (const sheetName of sheetsToProcess) {
        try {
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) {
            result[sheetName] = [];
            continue;
          }

          const data = this.processSheetData(worksheet, sheetName);
          result[sheetName] = data;
          
        } catch (error) {
          result[sheetName] = [];
        }
      }

      // Generate summary
      const summary: { [sheetName: string]: number } = {};
      let totalRecords = 0;
      
      Object.keys(result).forEach(sheetName => {
        const count = result[sheetName].length;
        summary[sheetName] = count;
        totalRecords += count;
      });

      const processingTime = Date.now() - startTime;
      return {
        success: true,
        sheetId,
        totalSheets: Object.keys(result).length,
        data: result,
        summary,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        success: false,
        sheetId: '',
        totalSheets: 0,
        data: {},
        summary: {},
        timestamp: new Date().toISOString(),
        error: (error as Error).message || 'Failed to fetch Google Sheets data',
      };
    }
  }

  // Method public: Fetch all sheets (legacy compatibility)
  public async fetchAllSheets(options: FetchOptions): Promise<FetchResult> {
    return this.fetchSheets(options);
  }

  // Method public: Validate URL without fetching
  public validateUrl(url: string): boolean {
    try {
      this.extractSheetId(url);
      return true;
    } catch {
      return false;
    }
  }

  // Method public: Get available sheets names only
  public async getSheetNames(url: string): Promise<string[]> {
    try {
      const sheetId = this.extractSheetId(url);
      const excelBuffer = await this.downloadExcelFile(sheetId);
      const workbook = XLSX.read(excelBuffer, { type: 'array' });
      return workbook.SheetNames;
    } catch (error) {
      return [];
    }
  }
}

export default GoogleSheetFetcher;
export type { FetchOptions, SheetData, FetchResult, ProgressCallback };