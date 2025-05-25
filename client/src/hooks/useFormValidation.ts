import { useState, useCallback, useEffect } from 'react';
import {
  validateField,
  validateForm,
  ValidationContext,
  ValidationResult,
  getFieldGuidance
} from '../services/validation';

/**
 * Custom hook for form validation with real-time feedback
 * @param initialValues Initial form values
 * @param context Additional validation context
 * @returns Form validation utilities
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  context: ValidationContext = {}
) {
  // Form values state
  const [values, setValues] = useState<T>(initialValues);
  
  // Track which fields have been touched (interacted with)
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Track field-specific validation results
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  
  // Track overall form validation state
  const [formState, setFormState] = useState<{
    isValid: boolean;
    overallScore: number;
    criticalErrors: any[];
  }>({
    isValid: false,
    overallScore: 0,
    criticalErrors: []
  });

  // Update a field value
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mark field as touched
    if (!touched[field as string]) {
      setTouched(prev => ({
        ...prev,
        [field]: true
      }));
    }
    
    // Validate the field
    const result = validateField(field as string, value, context, values);
    
    setValidationResults(prev => ({
      ...prev,
      [field]: result
    }));
  }, [touched, context, values]);
  
  // Mark a field as touched (e.g., on blur)
  const setTouchedField = useCallback((field: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({
      ...prev,
      [field]: isTouched
    }));
    
    // If newly touched, validate the field
    if (isTouched && !touched[field as string]) {
      const result = validateField(field as string, values[field], context, values);
      
      setValidationResults(prev => ({
        ...prev,
        [field]: result
      }));
    }
  }, [touched, values, context]);
  
  // Reset the form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setValidationResults({});
  }, [initialValues]);
  
  // Validate the entire form
  const validateAllFields = useCallback(() => {
    const result = validateForm(values, context);
    
    // Update validation results for all fields
    setValidationResults(result.results);
    
    // Update overall form state
    setFormState({
      isValid: result.isValid,
      overallScore: result.overallScore,
      criticalErrors: result.criticalErrors
    });
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    return result.isValid;
  }, [values, context]);
  
  // Get guidance for a specific field
  const getGuidance = useCallback((field: string) => {
    return getFieldGuidance(field);
  }, []);
  
  // Check if a field has errors (and has been touched)
  const hasError = useCallback((field: keyof T) => {
    return touched[field as string] && 
           validationResults[field as string]?.errors.length > 0;
  }, [touched, validationResults]);
  
  // Get error message for a field
  const getErrorMessage = useCallback((field: keyof T): string | null => {
    if (!hasError(field)) return null;
    return validationResults[field as string]?.errors[0]?.message || null;
  }, [hasError, validationResults]);
  
  // Get warnings for a field
  const getWarnings = useCallback((field: keyof T) => {
    return validationResults[field as string]?.warnings || [];
  }, [validationResults]);
  
  // Get score for a field (0-100, higher is better)
  const getScore = useCallback((field: keyof T): number => {
    return validationResults[field as string]?.score || 0;
  }, [validationResults]);
  
  // Get suggestions for a field
  const getSuggestions = useCallback((field: keyof T): string[] => {
    return validationResults[field as string]?.suggestions || [];
  }, [validationResults]);
  
  // Update form validity whenever validation results change
  useEffect(() => {
    // Only run if we have validation results
    if (Object.keys(validationResults).length === 0) return;
    
    // Check if any field has errors
    const hasErrors = Object.values(validationResults).some(result => 
      !result.isValid && result.errors.length > 0
    );
    
    // Calculate overall score (average of all fields)
    const fieldScores = Object.values(validationResults).map(result => result.score);
    const avgScore = fieldScores.length > 0
      ? Math.round(fieldScores.reduce((sum, score) => sum + score, 0) / fieldScores.length)
      : 0;
    
    // Collect all critical errors
    const allErrors = Object.values(validationResults)
      .flatMap(result => result.errors);
    
    setFormState({
      isValid: !hasErrors,
      overallScore: avgScore,
      criticalErrors: allErrors
    });
  }, [validationResults]);
  
  return {
    values,
    setValue,
    touched,
    setTouched: setTouchedField,
    resetForm,
    validateAll: validateAllFields,
    isValid: formState.isValid,
    overallScore: formState.overallScore,
    criticalErrors: formState.criticalErrors,
    hasError,
    getErrorMessage,
    getWarnings,
    getScore,
    getSuggestions,
    getGuidance
  };
}
