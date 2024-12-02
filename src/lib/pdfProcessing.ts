import { pdfjsLib } from './pdfjs';

export interface PDFValidationResult {
  isValid: boolean;
  error?: string;
  details?: {
    size: number;
    pages?: number;
    version?: string;
    isEncrypted?: boolean;
    isCorrupted?: boolean;
  };
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MIN_FILE_SIZE = 100; // 100 bytes
const SUPPORTED_PDF_VERSIONS = ['1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '2.0'];

export async function validatePDF(file: File): Promise<PDFValidationResult> {
  // Basic file validation
  if (!file.type.includes('pdf')) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a PDF file.',
      details: { size: file.size }
    };
  }

  // Size validation
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      details: { size: file.size }
    };
  }

  if (file.size < MIN_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File appears to be empty or corrupted.',
      details: { size: file.size }
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Check for PDF header signature
    const header = new Uint8Array(arrayBuffer.slice(0, 5));
    const isPDF = String.fromCharCode(...header) === '%PDF-';
    if (!isPDF) {
      return {
        isValid: false,
        error: 'Invalid PDF format. File does not have a valid PDF header.',
        details: { size: file.size, isCorrupted: true }
      };
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    
    // Handle password-protected PDFs
    loadingTask.onPassword = () => {
      throw new Error('PASSWORD_PROTECTED');
    };

    const pdf = await loadingTask.promise;
    const version = pdf.version;

    // Validate PDF version
    if (!SUPPORTED_PDF_VERSIONS.includes(version)) {
      return {
        isValid: false,
        error: `Unsupported PDF version ${version}. Please use PDF version 1.0-2.0.`,
        details: { size: file.size, version }
      };
    }

    // Check if document can be opened and pages can be accessed
    try {
      const firstPage = await pdf.getPage(1);
      await firstPage.getOperatorList(); // Verify page content is readable
    } catch (e) {
      return {
        isValid: false,
        error: 'PDF content appears to be corrupted or inaccessible.',
        details: { size: file.size, version, isCorrupted: true }
      };
    }

    return {
      isValid: true,
      details: {
        size: file.size,
        pages: pdf.numPages,
        version,
        isEncrypted: false,
        isCorrupted: false
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'PASSWORD_PROTECTED') {
        return {
          isValid: false,
          error: 'Password-protected PDFs are not supported. Please remove the password protection and try again.',
          details: { size: file.size, isEncrypted: true }
        };
      }
      
      if (error.message.includes('Invalid PDF structure')) {
        return {
          isValid: false,
          error: 'The PDF file appears to be corrupted. Please try repairing or re-saving the file.',
          details: { size: file.size, isCorrupted: true }
        };
      }
    }

    return {
      isValid: false,
      error: 'Failed to process PDF file. Please ensure it is a valid PDF document.',
      details: { size: file.size }
    };
  }
}

export function getReadableFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}