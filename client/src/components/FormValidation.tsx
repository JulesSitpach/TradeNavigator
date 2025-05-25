import React, { createContext, useContext, ReactNode } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { ValidationContext } from '../services/validation';

// Context type
interface FormValidationContextType<T extends Record<string, any>> {
  values: T;
  setValue: (field: keyof T, value: any) => void;
  touched: Record<string, boolean>;
  setTouched: (field: keyof T, isTouched?: boolean) => void;
  resetForm: () => void;
  validateAll: () => boolean;
  isValid: boolean;
  overallScore: number;
  hasError: (field: keyof T) => boolean;
  getErrorMessage: (field: keyof T) => string | null;
  getWarnings: (field: keyof T) => any[];
  getScore: (field: keyof T) => number;
  getSuggestions: (field: keyof T) => string[];
  getGuidance: (field: string) => {
    description: string;
    examples: string[];
    commonErrors: string[];
    tips: string[];
  };
}

// Create the context
const FormValidationContext = createContext<FormValidationContextType<any> | null>(null);

// Provider component
interface FormValidationProviderProps<T extends Record<string, any>> {
  initialValues: T;
  validationContext?: ValidationContext;
  children: ReactNode;
}

export function FormValidationProvider<T extends Record<string, any>>({
  initialValues,
  validationContext = {},
  children
}: FormValidationProviderProps<T>) {
  const validation = useFormValidation<T>(initialValues, validationContext);
  
  return (
    <FormValidationContext.Provider value={validation}>
      {children}
    </FormValidationContext.Provider>
  );
}

// Hook to use the form validation context
export function useFormValidationContext<T extends Record<string, any>>() {
  const context = useContext(FormValidationContext);
  
  if (!context) {
    throw new Error('useFormValidationContext must be used within a FormValidationProvider');
  }
  
  return context as FormValidationContextType<T>;
}

// Form field component with validation
interface FormFieldProps {
  name: string;
  label?: string;
  children: ReactNode;
  showGuidance?: boolean;
  showScore?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  children,
  showGuidance = false,
  showScore = false
}) => {
  const { 
    hasError, 
    getErrorMessage, 
    getWarnings, 
    getScore,
    getSuggestions,
    getGuidance
  } = useFormValidationContext();
  
  const error = hasError(name);
  const errorMessage = getErrorMessage(name);
  const warnings = getWarnings(name);
  const score = getScore(name);
  const suggestions = getSuggestions(name);
  const guidance = showGuidance ? getGuidance(name) : null;
  
  // Function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-700 bg-green-100';
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    if (score >= 30) return 'text-orange-700 bg-orange-50';
    return 'text-red-700 bg-red-50';
  };
  
  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      {/* Field */}
      {children}
      
      {/* Validation Score */}
      {showScore && (
        <div className="mt-1 flex items-center">
          <div className={`text-xs px-2 py-0.5 rounded ${getScoreColor(score)}`}>
            Score: {score}
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mt-1">
          {warnings.map((warning, index) => (
            <p key={index} className={`text-sm ${
              warning.severity === 'high' ? 'text-amber-600' :
              warning.severity === 'medium' ? 'text-amber-500' :
              'text-amber-400'
            }`}>
              {warning.message}
            </p>
          ))}
        </div>
      )}
      
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-1">
          <p className="text-sm text-gray-600">Suggestions:</p>
          <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Guidance */}
      {guidance && (
        <div className="mt-2 bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-gray-700 mb-1">{guidance.description}</p>
          
          {guidance.examples.length > 0 && (
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-700">Examples:</p>
              <div className="flex flex-wrap gap-2">
                {guidance.examples.map((example, index) => (
                  <span key={index} className="inline-block bg-white text-sm px-2 py-1 rounded border border-gray-200">
                    {example}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {guidance.tips.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700">Tips:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                {guidance.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Form submission button with validation state
interface FormSubmitButtonProps {
  children: ReactNode;
  disableIfInvalid?: boolean;
  showScore?: boolean;
  className?: string;
}

export const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({
  children,
  disableIfInvalid = true,
  showScore = true,
  className = ''
}) => {
  const { isValid, validateAll, overallScore } = useFormValidationContext();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isFormValid = validateAll();
    
    if (!isFormValid && disableIfInvalid) {
      e.preventDefault();
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-green-50 text-green-700';
    if (score >= 50) return 'bg-yellow-50 text-yellow-700';
    if (score >= 30) return 'bg-orange-50 text-orange-700';
    return 'bg-red-50 text-red-700';
  };
  
  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleClick}
        disabled={disableIfInvalid && !isValid}
        className={`py-2 px-4 rounded-md font-medium ${
          disableIfInvalid && !isValid
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } ${className}`}
      >
        {children}
      </button>
      
      {showScore && (
        <div className={`text-sm px-3 py-1 rounded-full ${getScoreColor(overallScore)}`}>
          Form Score: {overallScore}/100
        </div>
      )}
    </div>
  );
};
