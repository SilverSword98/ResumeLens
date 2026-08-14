import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

export async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      const data = await pdfParse(buffer);
      return data.text;
    } 
    
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      fileName.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    throw new Error('Unsupported file format. Please upload a PDF or DOCX.');
  } catch (error) {
    console.error('Extraction error:', error);
    throw new Error('Failed to extract text from the document. The file might be corrupted or password-protected.');
  }
}
