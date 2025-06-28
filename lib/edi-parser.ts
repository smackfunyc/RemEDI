import { EDIFile, EDISegment, ValidationResult } from '@/types/edi';

// EDI segment definitions for common transaction types
const EDI_SEGMENTS = {
  'ISA': 'Interchange Control Header',
  'GS': 'Functional Group Header',
  'ST': 'Transaction Set Header',
  'BEG': 'Beginning Segment for Purchase Order',
  'REF': 'Reference Identification',
  'DTM': 'Date/Time Reference',
  'N1': 'Name',
  'N3': 'Address Information',
  'N4': 'Geographic Location',
  'PO1': 'Baseline Item Data',
  'PID': 'Product/Item Description',
  'CTT': 'Transaction Totals',
  'SE': 'Transaction Set Trailer',
  'GE': 'Functional Group Trailer',
  'IEA': 'Interchange Control Trailer',
  'BSN': 'Beginning Segment for Ship Notice',
  'HL': 'Hierarchical Level',
  'TD1': 'Carrier Details (Quantity and Weight)',
  'TD5': 'Carrier Details (Routing Sequence/Transit Time)',
  'TD3': 'Carrier Details (Equipment)',
  'BIG': 'Beginning Segment for Invoice',
  'IT1': 'Baseline Item Data (Invoice)',
  'TDS': 'Total Monetary Value Summary',
  'CAD': 'Carrier Detail',
  'SAC': 'Service, Promotion, Allowance, or Charge Information'
};

export function parseEDIFile(fileContent: string, fileName: string): Partial<EDIFile> {
  const lines = fileContent.split('\n').filter(line => line.trim());
  const segments: EDISegment[] = [];
  const validationResults: ValidationResult[] = [];
  
  let transactionType = 'Unknown';
  let segmentCounter = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Split by common EDI delimiters
    const elements = trimmedLine.split(/[~*|]/).filter(el => el.trim());
    if (elements.length === 0) continue;

    const tag = elements[0];
    const segmentElements = elements.slice(1);

    // Determine transaction type from ST segment
    if (tag === 'ST' && segmentElements.length > 0) {
      const transactionCode = segmentElements[0];
      switch (transactionCode) {
        case '850':
          transactionType = 'Purchase Order';
          break;
        case '856':
          transactionType = 'Ship Notice/Manifest';
          break;
        case '810':
          transactionType = 'Invoice';
          break;
        case '997':
          transactionType = 'Functional Acknowledgment';
          break;
        default:
          transactionType = `Transaction ${transactionCode}`;
      }
    }

    const segment: EDISegment = {
      id: `seg_${segmentCounter++}`,
      tag,
      elements: segmentElements,
      description: EDI_SEGMENTS[tag as keyof typeof EDI_SEGMENTS] || 'Unknown Segment',
      isValid: true,
      errors: []
    };

    // Basic validation
    const validation = validateSegment(segment);
    if (validation.length > 0) {
      segment.isValid = false;
      segment.errors = validation.map(v => v.message);
      validationResults.push(...validation);
    }

    segments.push(segment);
  }

  // Overall file validation
  const fileValidation = validateEDIStructure(segments);
  validationResults.push(...fileValidation);

  return {
    fileName,
    fileSize: fileContent.length,
    transactionType,
    segments,
    validationResults,
    status: validationResults.some(v => v.type === 'error') ? 'error' : 'validated'
  };
}

function validateSegment(segment: EDISegment): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // Check for required segments
  if (['ISA', 'GS', 'ST'].includes(segment.tag) && segment.elements.length === 0) {
    results.push({
      id: `val_${Date.now()}_${Math.random()}`,
      type: 'error',
      segment: segment.tag,
      message: `${segment.tag} segment is missing required elements`,
      suggestion: 'Ensure all required elements are present'
    });
  }

  // Validate ISA segment structure
  if (segment.tag === 'ISA' && segment.elements.length < 16) {
    results.push({
      id: `val_${Date.now()}_${Math.random()}`,
      type: 'error',
      segment: segment.tag,
      message: 'ISA segment must contain 16 elements',
      suggestion: 'Check ISA segment format and ensure all elements are present'
    });
  }

  // Validate date formats in DTM segments
  if (segment.tag === 'DTM' && segment.elements.length >= 2) {
    const dateValue = segment.elements[1];
    if (dateValue && !/^\d{8}$/.test(dateValue)) {
      results.push({
        id: `val_${Date.now()}_${Math.random()}`,
        type: 'warning',
        segment: segment.tag,
        element: 2,
        message: 'Date format should be YYYYMMDD',
        suggestion: 'Use YYYYMMDD format for dates'
      });
    }
  }

  return results;
}

function validateEDIStructure(segments: EDISegment[]): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // Check for required header segments
  const hasISA = segments.some(s => s.tag === 'ISA');
  const hasGS = segments.some(s => s.tag === 'GS');
  const hasST = segments.some(s => s.tag === 'ST');
  
  if (!hasISA) {
    results.push({
      id: `val_${Date.now()}_${Math.random()}`,
      type: 'error',
      segment: 'FILE',
      message: 'Missing ISA (Interchange Control Header) segment',
      suggestion: 'Add ISA segment at the beginning of the file'
    });
  }
  
  if (!hasGS) {
    results.push({
      id: `val_${Date.now()}_${Math.random()}`,
      type: 'error',
      segment: 'FILE',
      message: 'Missing GS (Functional Group Header) segment',
      suggestion: 'Add GS segment after ISA segment'
    });
  }
  
  if (!hasST) {
    results.push({
      id: `val_${Date.now()}_${Math.random()}`,
      type: 'error',
      segment: 'FILE',
      message: 'Missing ST (Transaction Set Header) segment',
      suggestion: 'Add ST segment to identify transaction type'
    });
  }

  return results;
}

export function generateEDISummary(ediFile: EDIFile): string {
  const errorCount = ediFile.validationResults.filter(v => v.type === 'error').length;
  const warningCount = ediFile.validationResults.filter(v => v.type === 'warning').length;
  
  return `
EDI File Summary:
- Transaction Type: ${ediFile.transactionType}
- Total Segments: ${ediFile.segments.length}
- Validation Status: ${ediFile.status}
- Errors: ${errorCount}
- Warnings: ${warningCount}
- File Size: ${(ediFile.fileSize / 1024).toFixed(2)} KB
  `.trim();
}