import { pdfjsLib, loadPDFDocument } from './pdfjs';

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
  /** The parsed document, when validation succeeded. Reuse it instead of re-parsing the file. */
  document?: pdfjsLib.PDFDocumentProxy;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MIN_FILE_SIZE = 100; // 100 bytes
// Some producers write a leading comment or stray bytes before the header, and
// pdf.js tolerates that, so scan the start of the file rather than byte 0 only.
const HEADER_SEARCH_BYTES = 1024;

export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

function findHeaderVersion(bytes: Uint8Array): string | null {
  const prefix = new TextDecoder('latin1').decode(
    bytes.subarray(0, Math.min(bytes.length, HEADER_SEARCH_BYTES))
  );
  const match = prefix.match(/%PDF-(\d+\.\d+)/);
  return match ? match[1] : null;
}

export async function validatePDF(file: File): Promise<PDFValidationResult> {
  if (!isPDFFile(file)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a PDF file.',
      details: { size: file.size },
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      details: { size: file.size },
    };
  }

  if (file.size < MIN_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File appears to be empty or corrupted.',
      details: { size: file.size },
    };
  }

  let pdfVersion: string | null = null;

  try {
    const arrayBuffer = await file.arrayBuffer();
    pdfVersion = findHeaderVersion(new Uint8Array(arrayBuffer));

    if (!pdfVersion) {
      return {
        isValid: false,
        error: 'Invalid PDF format. File does not have a valid PDF header.',
        details: { size: file.size, isCorrupted: true },
      };
    }

    // No onPassword handler: pdf.js then rejects with a PasswordException we can
    // classify below. Throwing from the handler instead left the rejection
    // unhandled and surfaced as a generic failure.
    const pdf = await loadPDFDocument(arrayBuffer).promise;

    try {
      // Touching the first page is enough to catch a structurally broken file
      // without paying to parse its full operator list.
      await pdf.getPage(1);
    } catch {
      await pdf.destroy();
      return {
        isValid: false,
        error: 'PDF content appears to be corrupted or inaccessible.',
        details: { size: file.size, version: pdfVersion, isCorrupted: true },
      };
    }

    return {
      isValid: true,
      details: {
        size: file.size,
        pages: pdf.numPages,
        version: pdfVersion,
        isEncrypted: false,
        isCorrupted: false,
      },
      document: pdf,
    };
  } catch (error) {
    const name = error instanceof Error ? error.name : '';
    const message = error instanceof Error ? error.message : '';

    if (name === 'PasswordException' || /password/i.test(message)) {
      return {
        isValid: false,
        error:
          'Password-protected PDFs are not supported. Please remove the password protection and try again.',
        details: { size: file.size, version: pdfVersion ?? undefined, isEncrypted: true },
      };
    }

    if (name === 'InvalidPDFException' || /invalid pdf/i.test(message)) {
      return {
        isValid: false,
        error:
          'The PDF file appears to be corrupted. Please try repairing or re-saving the file.',
        details: { size: file.size, version: pdfVersion ?? undefined, isCorrupted: true },
      };
    }

    console.error('Error validating PDF:', error);

    return {
      isValid: false,
      error: message
        ? `Failed to process PDF file: ${message}`
        : 'Failed to process PDF file. Please ensure it is a valid PDF document.',
      details: { size: file.size, version: pdfVersion ?? undefined },
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
