import { pdfjsLib } from './pdfjs';

export interface PDFValidationResult {
  isValid: boolean;
  error?: string;
  details?: {
    size: number;
    pages?: number;
    version?: string;
  };
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const SUPPORTED_PDF_VERSIONS = ['1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '2.0'];

export async function validatePDF(file: File): Promise<PDFValidationResult> {
  // Check file type
  if (!file.type.includes('pdf')) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a PDF file.',
      details: { size: file.size }
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      details: { size: file.size }
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    return {
      isValid: true,
      details: {
        size: file.size,
        pages: pdf.numPages,
        version: pdf.version
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific PDF.js errors
      if (error.message.includes('Invalid PDF structure')) {
        return {
          isValid: false,
          error: 'The PDF file appears to be corrupted or invalid.',
          details: { size: file.size }
        };
      }
      if (error.message.includes('Password')) {
        return {
          isValid: false,
          error: 'Password-protected PDFs are not supported.',
          details: { size: file.size }
        };
      }
    }

    return {
      isValid: false,
      error: 'Failed to process PDF file. Please ensure it is a valid PDF.',
      details: { size: file.size }
    };
  }
}