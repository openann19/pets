import type { Request, Response, NextFunction } from 'express';

/**
 * Validated file interface for multipart uploads
 */
export interface ValidatedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * Extended Request interface with validated files
 */
declare module 'express' {
  interface Request {
    validatedFiles?: ValidatedFile[];
  }
}

/**
 * Multipart form data parser with additional security controls
 */
export class MultipartParser {
  private maxFileSize: number;
  private maxFiles: number;
  private allowedMimeTypes: string[];

  constructor(options: {
    maxFileSize?: number;
    maxFiles?: number;
    allowedMimeTypes?: string[];
  } = {}) {
    this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5MB
    this.maxFiles = options.maxFiles || 10;
    this.allowedMimeTypes = options.allowedMimeTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ];
  }

  /**
   * Safe multipart parser middleware
   */
  public parseMultipart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.is('multipart/form-data')) {
      next();
      return;
    }

    try {
      // Validate content length
      const contentLengthHeader = req.headers['content-length'];
      const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
      if (contentLength > 0 && contentLength > this.maxFileSize * this.maxFiles) {
        throw new Error('Total upload size exceeds limit');
      }

      // Parse and validate each file
      const files = await this.parseFiles(req);

      // Attach validated files to request
      req.validatedFiles = files;

      next();
    } catch (error) {
      res.status(400).json({
        error: 'Invalid multipart form data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  private async parseFiles(req: Request): Promise<ValidatedFile[]> {
    const files: ValidatedFile[] = [];
    let fileCount = 0;

    // Here we would use a secure multipart parser instead of dicer
    // This is a placeholder for the actual implementation
    const secureParser = await import('./secure-multipart-parser');

    return new Promise((resolve, reject) => {
      secureParser.parse(req, {
        maxFileSize: this.maxFileSize,
        onFile: (file: ValidatedFile) => {
          if (fileCount >= this.maxFiles) {
            reject(new Error('Too many files'));
            return;
          }

          if (!this.allowedMimeTypes.includes(file.mimetype)) {
            reject(new Error(`Invalid file type: ${file.mimetype}`));
            return;
          }

          files.push(file);
          fileCount++;
        },
        onError: (err: Error) => {
          reject(err);
        },
        onEnd: () => {
          resolve(files);
        }
      });
    });
  }
}