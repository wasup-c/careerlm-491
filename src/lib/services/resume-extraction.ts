
import { PDFParse } from "pdf-parse";

/**
 * Content already validated by Member 1.
 * This service does not handle upload security,
 * MIME validation, authentication, or storage.
 */
export type ValidatedResumeSource =
  | {
      kind: "pdf";
      bytes: Uint8Array;
    }
  | {
      kind: "text";
      text: string;
    };

export type ResumeExtractionErrorCode =
  | "UNREADABLE_RESUME"
  | "EXTRACTION_FAILED";

/**
 * Controlled errors that callers can safely handle.
 */
export class ResumeExtractionError extends Error {
  constructor(
    public readonly code: ResumeExtractionErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ResumeExtractionError";
  }
}

/**
 * Ensures extraction produced readable text.
 */
function requireReadableText(text: string): string {
  const cleaned = text.trim();

  if (!cleaned) {
    throw new ResumeExtractionError(
      "UNREADABLE_RESUME",
      "The resume contains no extractable text."
    );
  }

  return cleaned;
}

/**
 * Extracts text from an already validated PDF.
 */
async function extractPdfText(
  bytes: Uint8Array
): Promise<string> {
  let parser: PDFParse | undefined;

  try {
    // Copy the bytes so parsing cannot modify
    // the caller's underlying data.
    parser = new PDFParse({
      data: new Uint8Array(bytes),
    });

    const result = await parser.getText();

    return requireReadableText(result.text);
  } catch (error) {
    if (error instanceof ResumeExtractionError) {
      throw error;
    }

    throw new ResumeExtractionError(
      "EXTRACTION_FAILED",
      "Unable to extract text from the PDF."
    );
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch {
        // Avoid replacing the extraction result
        // with a cleanup error.
      }
    }
  }
}

/**
 * Main résumé extraction entry point.
 *
 * Input: validated PDF bytes or pasted text.
 * Output: readable text.
 *
 * Does not perform persistence or authentication.
 */
export async function extractResumeText(
  source: ValidatedResumeSource
): Promise<string> {
  if (source.kind === "text") {
    return requireReadableText(source.text);
  }

  return extractPdfText(source.bytes);
}
