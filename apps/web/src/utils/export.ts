/**
 * Export Utilities for Dashboard Data
 * Supports CSV, JSON, and PDF export formats
 */

import { logger } from '../services/logger';

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
  delimiter?: string;
}

/**
 * Export dashboard data to various formats
 */
export class DataExporter {
  /**
   * Export data as CSV
   */
  static exportToCSV(data: Record<string, unknown>[], options: ExportOptions = {}): void {
    try {
      if (!data.length) {
        throw new Error('No data to export');
      }

      const {
        filename = 'export',
        includeTimestamp = true,
        delimiter = ','
      } = options;

      // Get all unique keys from the data
      const headers = Array.from(
        new Set(data.flatMap(item => Object.keys(item)))
      );

      // Create CSV content
      const csvContent = [
        headers.join(delimiter),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header];
            // Escape values containing delimiter, quotes, or newlines
            const stringValue = String(value ?? '');
            if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(delimiter)
        )
      ].join('\n');

      this.downloadFile(
        csvContent,
        `${filename}${includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : ''}.csv`,
        'text/csv'
      );

      logger.info('CSV export completed', { filename, recordCount: data.length });
    } catch (error) {
      logger.error('CSV export failed', { error });
      throw error;
    }
  }

  /**
   * Export data as JSON
   */
  static exportToJSON(data: unknown, options: ExportOptions = {}): void {
    try {
      const {
        filename = 'export',
        includeTimestamp = true
      } = options;

      const jsonContent = JSON.stringify(data, null, 2);

      this.downloadFile(
        jsonContent,
        `${filename}${includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : ''}.json`,
        'application/json'
      );

      logger.info('JSON export completed', { filename });
    } catch (error) {
      logger.error('JSON export failed', { error });
      throw error;
    }
  }

  /**
   * Export data as PDF (basic implementation)
   * Note: For production, consider using libraries like jsPDF or react-pdf
   */
  static exportToPDF(data: Record<string, unknown>, options: ExportOptions = {}): void {
    try {
      const {
        filename = 'export',
        includeTimestamp = true
      } = options;

      // Create a simple HTML representation for PDF generation
      const htmlContent = this.generateHTMLForPDF(data);

      // For now, we'll create a downloadable HTML file
      // In production, this would use a PDF library
      this.downloadFile(
        htmlContent,
        `${filename}${includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : ''}.html`,
        'text/html'
      );

      logger.info('PDF export completed (HTML format)', { filename });
    } catch (error) {
      logger.error('PDF export failed', { error });
      throw error;
    }
  }

  /**
   * Generate HTML content for PDF export
   */
  private static generateHTMLForPDF(data: Record<string, unknown>): string {
    const timestamp = new Date().toLocaleString();

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PawfectMatch Dashboard Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2563eb; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 8px 12px; text-align: left; border: 1px solid #e5e7eb; }
          th { background-color: #f9fafb; font-weight: bold; }
          .timestamp { color: #6b7280; font-size: 0.875rem; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>PawfectMatch Dashboard Export</h1>
        <p class="timestamp">Generated on: ${timestamp}</p>
    `;

    // Generate sections for different data types
    Object.entries(data).forEach(([section, sectionData]) => {
      html += `<h2>${this.formatTitle(section)}</h2>`;

      if (Array.isArray(sectionData)) {
        html += this.generateTableFromArray(sectionData);
      } else if (typeof sectionData === 'object' && sectionData !== null) {
        html += this.generateTableFromObject(sectionData as Record<string, unknown>);
      } else {
        html += `<p>${String(sectionData)}</p>`;
      }
    });

    html += `
      </body>
      </html>
    `;

    return html;
  }

  /**
   * Generate HTML table from array data
   */
  private static generateTableFromArray(data: unknown[]): string {
    if (!data.length) return '<p>No data available</p>';

    const headers = Array.from(
      new Set(data.flatMap(item =>
        typeof item === 'object' && item !== null ? Object.keys(item) : []
      ))
    );

    let table = '<table><thead><tr>';
    headers.forEach(header => {
      table += `<th>${this.formatTitle(header)}</th>`;
    });
    table += '</tr></thead><tbody>';

    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        table += '<tr>';
        headers.forEach(header => {
          const value = (item as Record<string, unknown>)[header];
          table += `<td>${this.formatValue(value)}</td>`;
        });
        table += '</tr>';
      }
    });

    table += '</tbody></table>';
    return table;
  }

  /**
   * Generate HTML table from object data
   */
  private static generateTableFromObject(data: Record<string, unknown>): string {
    let table = '<table><tbody>';

    Object.entries(data).forEach(([key, value]) => {
      table += `<tr><td><strong>${this.formatTitle(key)}</strong></td><td>${this.formatValue(value)}</td></tr>`;
    });

    table += '</tbody></table>';
    return table;
  }

  /**
   * Format title for display
   */
  private static formatTitle(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  }

  /**
   * Format value for display
   */
  private static formatValue(value: unknown): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  /**
   * Download file using browser APIs
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('File download failed', { error, filename });
      throw new Error('Failed to download file');
    }
  }
}

/**
 * Export dashboard analytics data
 */
export const exportDashboardData = (
  data: Record<string, unknown>,
  format: ExportFormat,
  options: ExportOptions = {}
): void => {
  const { filename = 'dashboard-export' } = options;

  try {
    switch (format) {
      case 'csv': {
        // Convert nested object to flat array for CSV
        const flattenedData = flattenDashboardData(data);
        DataExporter.exportToCSV(flattenedData, { ...options, filename });
        break;
      }

      case 'json':
        DataExporter.exportToJSON(data, { ...options, filename });
        break;

      case 'pdf':
        DataExporter.exportToPDF(data, { ...options, filename });
        break;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    logger.info('Dashboard export completed', { format, filename });
  } catch (error) {
    logger.error('Dashboard export failed', { error, format, filename });
    throw error;
  }
};

/**
 * Flatten nested dashboard data for CSV export
 */
function flattenDashboardData(data: Record<string, unknown>): Record<string, unknown>[] {
  const result: Record<string, unknown>[] = [];

  Object.entries(data).forEach(([section, sectionData]) => {
    if (Array.isArray(sectionData)) {
      sectionData.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          result.push({
            section,
            index,
            ...flattenObject(item as Record<string, unknown>)
          });
        }
      });
    } else if (typeof sectionData === 'object' && sectionData !== null) {
      result.push({
        section,
        ...flattenObject(sectionData as Record<string, unknown>)
      });
    } else {
      result.push({
        section,
        value: sectionData
      });
    }
  });

  return result;
}

/**
 * Flatten nested object for CSV export
 */
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else if (Array.isArray(value)) {
      result[newKey] = value.join('; '); // Join arrays for CSV
    } else {
      result[newKey] = value;
    }
  });

  return result;
}
