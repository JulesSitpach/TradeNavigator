/**
 * Data Validation Framework
 * 
 * This module provides comprehensive validation utilities:
 * - Progressive validation with contextual help
 * - Cross-field validation rules
 * - Real-time guidance for complex inputs
 * - Validation score system to highlight potential issues
 */

// Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100, higher is better
  suggestions?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ValidationContext {
  countryPair?: [string, string];
  hsCode?: string;
  tariffCode?: string;
  productCategory?: string;
  regulationType?: string;
  includeSpecialPrograms?: boolean;
}

export interface FieldValidationRule {
  field: string;
  validator: (value: any, context?: ValidationContext) => ValidationResult;
  dependencies?: string[]; // Other fields this validation depends on
  isRequired?: boolean;
  runCondition?: (values: Record<string, any>) => boolean; // When to run this validation
}

/**
 * Validate a single field
 * @param field The field name
 * @param value The field value
 * @param context Additional context for validation
 * @param allValues All form values (for cross-field validation)
 * @returns Validation result for the field
 */
export function validateField(
  field: string,
  value: any,
  context: ValidationContext = {},
  allValues: Record<string, any> = {}
): ValidationResult {
  // Get the appropriate validator for this field
  const validator = getFieldValidator(field);
  
  if (!validator) {
    // No specific validator, perform basic validation
    return basicValidation(field, value);
  }
  
  // Check if validation should run based on condition
  if (validator.runCondition && !validator.runCondition(allValues)) {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      score: 100
    };
  }
  
  // Check if field is required but empty
  if (validator.isRequired && (value === undefined || value === null || value === '')) {
    return {
      isValid: false,
      errors: [{
        field,
        message: `${field} is required`,
        code: 'required'
      }],
      warnings: [],
      score: 0
    };
  }
  
  // Run the field-specific validator
  return validator.validator(value, context);
}

/**
 * Validate a complete form
 * @param values Form values
 * @param context Additional context for validation
 * @returns Complete validation result
 */
export function validateForm(
  values: Record<string, any>,
  context: ValidationContext = {}
): {
  isValid: boolean;
  results: Record<string, ValidationResult>;
  overallScore: number;
  criticalErrors: ValidationError[];
} {
  const results: Record<string, ValidationResult> = {};
  let totalScore = 0;
  let fieldsCount = 0;
  const criticalErrors: ValidationError[] = [];
  
  // Get all field validators
  const validators = getAllFieldValidators();
  
  // Track dependent validations to run after initial pass
  const dependentValidations: Array<{
    field: string;
    validator: FieldValidationRule;
  }> = [];
  
  // First pass: validate fields without dependencies
  for (const validator of validators) {
    if (validator.dependencies && validator.dependencies.length > 0) {
      // Save for second pass
      dependentValidations.push({
        field: validator.field,
        validator
      });
      continue;
    }
    
    // Check if validation should run based on condition
    if (validator.runCondition && !validator.runCondition(values)) {
      results[validator.field] = {
        isValid: true,
        errors: [],
        warnings: [],
        score: 100
      };
      continue;
    }
    
    const value = values[validator.field];
    
    // Validate the field
    results[validator.field] = validateField(validator.field, value, context, values);
    
    // Track scores for fields with values or required fields
    if (value !== undefined || validator.isRequired) {
      totalScore += results[validator.field].score;
      fieldsCount++;
    }
    
    // Track critical errors
    if (!results[validator.field].isValid) {
      criticalErrors.push(...results[validator.field].errors);
    }
  }
  
  // Second pass: validate fields with dependencies
  for (const { field, validator } of dependentValidations) {
    // Skip if condition fails
    if (validator.runCondition && !validator.runCondition(values)) {
      results[field] = {
        isValid: true,
        errors: [],
        warnings: [],
        score: 100
      };
      continue;
    }
    
    const value = values[field];
    
    // Validate the field
    results[field] = validateField(field, value, context, values);
    
    // Track scores for fields with values or required fields
    if (value !== undefined || validator.isRequired) {
      totalScore += results[field].score;
      fieldsCount++;
    }
    
    // Track critical errors
    if (!results[field].isValid) {
      criticalErrors.push(...results[field].errors);
    }
  }
  
  // Calculate overall score
  const overallScore = fieldsCount > 0 ? Math.round(totalScore / fieldsCount) : 100;
  
  return {
    isValid: criticalErrors.length === 0,
    results,
    overallScore,
    criticalErrors
  };
}

/**
 * Get field-specific validation guidance
 * @param field The field name
 * @returns Guidance for the field
 */
export function getFieldGuidance(field: string): {
  description: string;
  examples: string[];
  commonErrors: string[];
  tips: string[];
} {
  // Field-specific guidance
  switch (field) {
    case 'hsCode':
      return {
        description: 'The Harmonized System code for your product',
        examples: ['8471.30', '8517.12', '9403.30'],
        commonErrors: [
          'Missing section digits',
          'Invalid format (should be XX.XX or XXXX.XX)',
          'Non-existent HS code'
        ],
        tips: [
          'Use periods to separate sections',
          'Most HS codes are 6 digits, sometimes with a period after the first 2 or 4 digits',
          'You can search for your product\'s HS code if unsure'
        ]
      };
    
    case 'countryOrigin':
      return {
        description: 'The country where the goods were manufactured or produced',
        examples: ['US', 'CA', 'CN', 'DE'],
        commonErrors: [
          'Using a region instead of a country code',
          'Using a country name instead of code',
          'Using an invalid or outdated country code'
        ],
        tips: [
          'Use ISO 2-letter country codes (e.g., US for United States)',
          'For special customs territories, check the special codes list',
          'The country of origin affects duty rates and eligibility for trade agreements'
        ]
      };
    
    case 'importValue':
      return {
        description: 'The monetary value of the imported goods',
        examples: ['1000.00', '25000', '500000'],
        commonErrors: [
          'Including currency symbols',
          'Using commas as decimal separators',
          'Entering a value that doesn\'t match quantity and unit price'
        ],
        tips: [
          'Enter numeric values only without currency symbols',
          'Use periods as decimal separators',
          'The value should be the total price paid or payable for the goods'
        ]
      };
    
    // Add more fields as needed
    
    default:
      return {
        description: 'Enter the appropriate value for this field',
        examples: [],
        commonErrors: ['Invalid format', 'Missing required information'],
        tips: ['Refer to the field label for guidance']
      };
  }
}

/**
 * Get a summary of country-specific requirements
 * @param countryCode The country code
 * @returns Special requirements for the country
 */
export function getCountryRequirements(countryCode: string): {
  documentation: string[];
  restrictions: string[];
  specialPrograms: string[];
} {
  // Country-specific requirements
  switch (countryCode.toUpperCase()) {
    case 'US':
      return {
        documentation: [
          'Commercial Invoice',
          'Packing List',
          'Bill of Lading or Air Waybill',
          'CBP Form 7501 (Entry Summary)',
          'FDA Prior Notice (for food products)'
        ],
        restrictions: [
          'Prohibited items include certain agricultural products, narcotics, and hazardous materials',
          'Restricted items require special permits or licenses'
        ],
        specialPrograms: [
          'Generalized System of Preferences (GSP)',
          'USMCA (formerly NAFTA)',
          'Foreign Trade Zones'
        ]
      };
    
    case 'CN':
      return {
        documentation: [
          'Commercial Invoice',
          'Packing List',
          'Bill of Lading or Air Waybill',
          'Import License or Automatic Import License',
          'Certificate of Origin',
          'CIQ Inspection and Quarantine Certificate (for certain products)'
        ],
        restrictions: [
          'Prohibited items include used machinery, certain publications, and waste products',
          'Many products require specific import licenses or certifications'
        ],
        specialPrograms: [
          'Free Trade Zones',
          'Processing Trade Relief',
          'Cross Border E-Commerce Zones'
        ]
      };
    
    case 'EU':
      return {
        documentation: [
          'Commercial Invoice',
          'Packing List',
          'Bill of Lading or Air Waybill',
          'Single Administrative Document (SAD)',
          'Certificate of Origin',
          'EU Conformity Documentation (for regulated products)'
        ],
        restrictions: [
          'Prohibited items include counterfeit goods, GMO products (in some cases), and products not meeting EU standards',
          'REACH compliance required for chemicals',
          'CE marking required for many product categories'
        ],
        specialPrograms: [
          'Authorized Economic Operator (AEO)',
          'GSP for developing countries',
          'Inward Processing Relief'
        ]
      };
    
    // Add more countries as needed
    
    default:
      return {
        documentation: [
          'Commercial Invoice',
          'Packing List',
          'Bill of Lading or Air Waybill',
          'Certificate of Origin'
        ],
        restrictions: [
          'Import restrictions may apply to certain products',
          'Check with the customs authority for specific requirements'
        ],
        specialPrograms: [
          'Check for applicable trade agreements and special import programs'
        ]
      };
  }
}

// Private helper functions

/**
 * Get a validator for a specific field
 */
function getFieldValidator(field: string): FieldValidationRule | null {
  const validators = getAllFieldValidators();
  return validators.find(v => v.field === field) || null;
}

/**
 * Get all field validators
 */
function getAllFieldValidators(): FieldValidationRule[] {
  return [
    {
      field: 'hsCode',
      isRequired: true,
      validator: validateHsCode
    },
    {
      field: 'countryOrigin',
      isRequired: true,
      validator: validateCountryCode
    },
    {
      field: 'countryDestination',
      isRequired: true,
      validator: validateCountryCode
    },
    {
      field: 'importValue',
      isRequired: true,
      validator: validateCurrency
    },
    {
      field: 'quantity',
      isRequired: true,
      validator: validateNumber
    },
    {
      field: 'unitPrice',
      isRequired: false,
      dependencies: ['importValue', 'quantity'],
      validator: validateUnitPrice,
      runCondition: (values) => values.importValue !== undefined && values.quantity !== undefined
    },
    {
      field: 'weight',
      isRequired: false,
      validator: validateWeight
    },
    {
      field: 'productDescription',
      isRequired: true,
      validator: validateProductDescription
    },
    // Add more field validators as needed
  ];
}

/**
 * Basic validation for fields without specific validators
 */
function basicValidation(field: string, value: any): ValidationResult {
  // Check if value is provided
  const isEmpty = value === undefined || value === null || value === '';
  
  if (isEmpty) {
    return {
      isValid: false,
      errors: [{
        field,
        message: `${field} is required`,
        code: 'required'
      }],
      warnings: [],
      score: 0
    };
  }
  
  return {
    isValid: true,
    errors: [],
    warnings: [],
    score: 100
  };
}

/**
 * Validate HS code format and validity
 */
function validateHsCode(value: string, context?: ValidationContext): ValidationResult {
  if (!value) {
    return {
      isValid: false,
      errors: [{
        field: 'hsCode',
        message: 'HS code is required',
        code: 'required'
      }],
      warnings: [],
      score: 0
    };
  }
  
  // Remove any spaces
  const cleanValue = value.replace(/\s/g, '');
  
  // Check basic format (digits and periods only)
  const formatRegex = /^[0-9.]+$/;
  if (!formatRegex.test(cleanValue)) {
    return {
      isValid: false,
      errors: [{
        field: 'hsCode',
        message: 'HS code must contain only digits and periods',
        code: 'format'
      }],
      warnings: [],
      score: 0,
      suggestions: ['Remove any non-numeric characters except periods']
    };
  }
  
  // Check for valid patterns (e.g., XX.XX, XXXX.XX, or XXXXXX)
  const validPatterns = [
    /^\d{2}\.\d{2}$/, // XX.XX
    /^\d{4}\.\d{2}$/, // XXXX.XX
    /^\d{6}$/, // XXXXXX
    /^\d{8}$/, // XXXXXXXX (some countries use 8-digit codes)
    /^\d{10}$/ // XXXXXXXXXX (some countries use 10-digit codes)
  ];
  
  const isValidPattern = validPatterns.some(pattern => pattern.test(cleanValue));
  
  if (!isValidPattern) {
    return {
      isValid: false,
      errors: [{
        field: 'hsCode',
        message: 'Invalid HS code format',
        code: 'pattern'
      }],
      warnings: [],
      score: 30,
      suggestions: [
        'Use format XX.XX, XXXX.XX, or XXXXXX',
        'Check if you\'re missing digits or periods'
      ]
    };
  }
  
  // In a real implementation, we would validate against a database of valid HS codes
  // For now, assume it's valid if it has the right format
  
  // Add warning if the code seems uncommon
  const warnings: ValidationWarning[] = [];
  if (cleanValue.startsWith('00') || cleanValue.startsWith('99')) {
    warnings.push({
      field: 'hsCode',
      message: 'This appears to be an uncommon or special HS code',
      code: 'uncommon',
      severity: 'medium'
    });
  }
  
  // Calculate score based on format and warnings
  const score = 100 - (warnings.length * 15);
  
  return {
    isValid: true,
    errors: [],
    warnings,
    score
  };
}

/**
 * Validate country code
 */
function validateCountryCode(value: string): ValidationResult {
  if (!value) {
    return {
      isValid: false,
      errors: [{
        field: 'countryCode',
        message: 'Country code is required',
        code: 'required'
      }],
      warnings: [],
      score: 0
    };
  }
  
  // Check format (2-letter ISO code)
  const formatRegex = /^[A-Za-z]{2}$/;
  if (!formatRegex.test(value)) {
    return {
      isValid: false,
      errors: [{
        field: 'countryCode',
        message: 'Country code must be a 2-letter ISO code',
        code: 'format'
      }],
      warnings: [],
      score: 0,
      suggestions: ['Use a 2-letter country code like US, CA, UK, CN']
    };
  }
  
  // In a real implementation, we would validate against a list of valid country codes
  // For now, assume it's valid if it has the right format
  
  return {
    isValid: true,
    errors: [],
    warnings: [],
    score: 100
  };
}

/**
 * Validate currency value
 */
function validateCurrency(value: string | number): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return {
      isValid: false,
      errors: [{
        field: 'currency',
        message: 'Value is required',
        code: 'required'
      }],
      warnings: [],
      score: 0
    };
  }
  
  // Convert to number
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  
  if (isNaN(numValue)) {
    return {
      isValid: false,
      errors: [{
        field: 'currency',
        message: 'Must be a valid number',
        code: 'format'
      }],
      warnings: [],
      score: 0,
      suggestions: ['Enter a numeric value without currency symbols']
    };
  }
  
  if (numValue <= 0) {
    return {
      isValid: false,
      errors: [{
        field: 'currency',
        message: 'Value must be greater than zero',
        code: 'range'
      }],
      warnings: [],
      score: 0
    };
  }
  
  const warnings: ValidationWarning[] = [];
  
  // Check for suspiciously high or low values
  if (numValue < 10) {
    warnings.push({
      field: 'currency',
      message: 'Value seems unusually low',
      code: 'suspicious_low',
      severity: 'low'
    });
  } else if (numValue > 1000000) {
    warnings.push({
      field: 'currency',
      message: 'Value seems unusually high',
      code: 'suspicious_high',
      severity: 'medium'
    });
  }
  
  // Calculate score based on warnings
  const score = 100 - (warnings.length * 15);
  
  return {
    isValid: true,
    errors: [],
    warnings,
    score
  };
}

/**
 * Validate numeric value
 */
function validateNumber(value: string | number): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return {
      isValid: false,
      errors: [{
        field: 'number',
        message: 'Value is required',
        code: 'required'
      }],
      warnings: [],
      score: 0
    };
  }
  
  // Convert to number
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  
  if (isNaN(numValue)) {
    return {
      isValid: false,
      errors: [{
        field: 'number',
        message: 'Must be a valid number',
        code: 'format'
      }],
      warnings: [],
      score: 0,
      suggestions: ['Enter a numeric value']
    };
  }
  
  if (numValue <= 0) {
    return {
      isValid: false,
      errors: [{
        field: 'number',
        message: 'Value must be greater than zero',
        code: 'range'
      }],
      warnings: [],
      score: 0
    };
  }
  
  return {
    isValid: true,
    errors: [],
    warnings: [],
    score: 100
  };
}

/**
 * Validate unit price based on total value and quantity
 */
function validateUnitPrice(value: string | number, context?: ValidationContext, allValues?: Record<string, any>): ValidationResult {
  if (!allValues || !allValues.importValue || !allValues.quantity) {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      score: 100
    };
  }
  
  // Convert to numbers
  const totalValue = parseFloat(String(allValues.importValue).replace(/[^\d.-]/g, ''));
  const quantity = parseFloat(String(allValues.quantity).replace(/[^\d.-]/g, ''));
  const unitPrice = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  
  if (isNaN(totalValue) || isNaN(quantity) || isNaN(unitPrice)) {
    return {
      isValid: true, // Not making this a hard error
      errors: [],
      warnings: [{
        field: 'unitPrice',
        message: 'Cannot validate unit price against total value and quantity',
        code: 'validation_error',
        severity: 'medium'
      }],
      score: 70
    };
  }
  
  // Calculate expected unit price
  const expectedUnitPrice = totalValue / quantity;
  const tolerance = 0.05; // 5% tolerance
  
  // Check if the unit price is within tolerance of the expected value
  const lowerBound = expectedUnitPrice * (1 - tolerance);
  const upperBound = expectedUnitPrice * (1 + tolerance);
  
  if (unitPrice < lowerBound || unitPrice > upperBound) {
    return {
      isValid: true, // Not making this a hard error
      errors: [],
      warnings: [{
        field: 'unitPrice',
        message: `Unit price (${unitPrice.toFixed(2)}) doesn't match total value / quantity (${expectedUnitPrice.toFixed(2)})`,
        code: 'inconsistent',
        severity: 'high'
      }],
      score: 50,
      suggestions: [
        `Expected unit price: ${expectedUnitPrice.toFixed(2)}`,
        'Verify total value and quantity'
      ]
    };
  }
  
  return {
    isValid: true,
    errors: [],
    warnings: [],
    score: 100
  };
}

/**
 * Validate weight
 */
function validateWeight(value: string | number): ValidationResult {
  if (!value) {
    return {
      isValid: true, // Weight may not be required
      errors: [],
      warnings: [],
      score: 100
    };
  }
  
  // Convert to number
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  
  if (isNaN(numValue)) {
    return {
      isValid: false,
      errors: [{
        field: 'weight',
        message: 'Must be a valid number',
        code: 'format'
      }],
      warnings: [],
      score: 0,
      suggestions: ['Enter a numeric value']
    };
  }
  
  if (numValue <= 0) {
    return {
      isValid: false,
      errors: [{
        field: 'weight',
        message: 'Weight must be greater than zero',
        code: 'range'
      }],
      warnings: [],
      score: 0
    };
  }
  
  const warnings: ValidationWarning[] = [];
  
  // Check for suspiciously high values
  if (numValue > 10000) {
    warnings.push({
      field: 'weight',
      message: 'Weight seems unusually high',
      code: 'suspicious_high',
      severity: 'medium'
    });
  }
  
  // Calculate score based on warnings
  const score = 100 - (warnings.length * 15);
  
  return {
    isValid: true,
    errors: [],
    warnings,
    score
  };
}

/**
 * Validate product description
 */
function validateProductDescription(value: string): ValidationResult {
  if (!value) {
    return {
      isValid: false,
      errors: [{
        field: 'productDescription',
        message: 'Product description is required',
        code: 'required'
      }],
      warnings: [],
      score: 0
    };
  }
  
  const warnings: ValidationWarning[] = [];
  
  // Check for minimal length
  if (value.length < 10) {
    return {
      isValid: false,
      errors: [{
        field: 'productDescription',
        message: 'Description is too short',
        code: 'length'
      }],
      warnings: [],
      score: 30,
      suggestions: ['Provide a more detailed description of the product']
    };
  }
  
  // Check for generic descriptions
  const genericTerms = ['product', 'item', 'goods', 'merchandise', 'parts'];
  const hasOnlyGenericTerms = genericTerms.some(term => 
    value.toLowerCase().includes(term) && value.length < term.length + 10
  );
  
  if (hasOnlyGenericTerms) {
    warnings.push({
      field: 'productDescription',
      message: 'Description appears too generic',
      code: 'generic',
      severity: 'high'
    });
  }
  
  // Check for missing specifications
  const hasSpecifications = /material|dimension|size|color|model|brand/i.test(value);
  if (!hasSpecifications) {
    warnings.push({
      field: 'productDescription',
      message: 'Consider adding specifications (material, size, brand, etc.)',
      code: 'missing_specs',
      severity: 'medium'
    });
  }
  
  // Calculate score based on length and warnings
  let score = Math.min(100, Math.max(50, value.length / 2));
  score -= warnings.length * 15;
  
  return {
    isValid: true,
    errors: [],
    warnings,
    score: Math.round(score),
    suggestions: warnings.length > 0 ? [
      'Include specific details about the product',
      'Mention material, dimensions, brand, and model when applicable',
      'Avoid overly generic descriptions'
    ] : undefined
  };
}
