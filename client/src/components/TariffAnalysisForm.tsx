import React from 'react';
import { FormValidationProvider, FormField, FormSubmitButton } from './FormValidation';
import { useCachedForm } from '../hooks/useCached';
import { useToast } from '../hooks/useNotification';
import { useApi } from '../hooks/useApi';
import { ApiEndpoint } from '../services/apiClient';
import { getCountryRequirements } from '../services/validation';

// Initial form values
const initialValues = {
  hsCode: '',
  productDescription: '',
  countryOrigin: '',
  countryDestination: '',
  quantity: '',
  unitPrice: '',
  weight: '',
  transportMethod: 'sea',
  isHazardous: false,
  isPerishable: false,
  useTradeAgreement: true
};

// Transport method options
const transportMethods = [
  { id: 'sea', name: 'Sea Freight' },
  { id: 'air', name: 'Air Freight' },
  { id: 'road', name: 'Road Transport' },
  { id: 'rail', name: 'Rail Transport' },
  { id: 'multimodal', name: 'Multimodal' }
];

const TariffAnalysisForm: React.FC = () => {
  // Use our cached form hook
  const [formValues, updateFormValue, resetForm] = useCachedForm('tariff-analysis', initialValues);
  
  // Toast notifications
  const toast = useToast();
  
  // API hook for HS code suggestions
  const [hsSuggestions, hsSuggestionsLoading] = useApi<string[]>(
    ApiEndpoint.HS_CODES,
    'suggest',
    {
      skipInitialRequest: true
    }
  );
  
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real implementation, this would send the data to the server
      // For now, just show a success toast
      toast.success('Tariff analysis submitted successfully!');
      
      // Reset the form
      resetForm();
    } catch (error) {
      toast.error('Error submitting tariff analysis');
      console.error('Submission error:', error);
    }
  };
  
  // Get destination country requirements when country changes
  const destinationCountry = formValues.countryDestination;
  const countryReqs = destinationCountry ? getCountryRequirements(destinationCountry) : null;
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold mb-6">Tariff Analysis Calculator</h2>
      
      <FormValidationProvider 
        initialValues={formValues}
        validationContext={{ 
          countryPair: formValues.countryOrigin && formValues.countryDestination 
            ? [formValues.countryOrigin, formValues.countryDestination]
            : undefined
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Information Section */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Product Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField 
                name="hsCode" 
                label="HS Code" 
                showGuidance
              >
                <div className="relative">
                  <input
                    id="hsCode"
                    type="text"
                    value={formValues.hsCode}
                    onChange={(e) => updateFormValue('hsCode', e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 8471.30"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-blue-600 text-sm hover:text-blue-800"
                    onClick={() => {
                      // Trigger HS code suggestion API
                      if (formValues.productDescription) {
                        // This would be a real API call in production
                        toast.info('Finding HS code suggestions...', 'AI Suggestion');
                      } else {
                        toast.warning('Please enter a product description first');
                      }
                    }}
                  >
                    Suggest
                  </button>
                </div>
              </FormField>
              
              <FormField 
                name="productDescription" 
                label="Product Description"
                showGuidance
              >
                <textarea
                  id="productDescription"
                  value={formValues.productDescription}
                  onChange={(e) => updateFormValue('productDescription', e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed description of your product"
                />
              </FormField>
            </div>
          </div>
          
          {/* Countries Section */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Origin & Destination</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField 
                name="countryOrigin" 
                label="Country of Origin"
              >
                <input
                  id="countryOrigin"
                  type="text"
                  value={formValues.countryOrigin}
                  onChange={(e) => updateFormValue('countryOrigin', e.target.value.toUpperCase())}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., US"
                  maxLength={2}
                />
              </FormField>
              
              <FormField 
                name="countryDestination" 
                label="Destination Country"
              >
                <input
                  id="countryDestination"
                  type="text"
                  value={formValues.countryDestination}
                  onChange={(e) => updateFormValue('countryDestination', e.target.value.toUpperCase())}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., CN"
                  maxLength={2}
                />
              </FormField>
            </div>
            
            {/* Show country requirements if available */}
            {countryReqs && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">
                  Requirements for {formValues.countryDestination}
                </h4>
                
                {countryReqs.documentation.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700">Required Documentation:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                      {countryReqs.documentation.map((doc, index) => (
                        <li key={index}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {countryReqs.restrictions.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700">Restrictions:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                      {countryReqs.restrictions.map((restriction, index) => (
                        <li key={index}>{restriction}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {countryReqs.specialPrograms.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Special Programs:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                      {countryReqs.specialPrograms.map((program, index) => (
                        <li key={index}>{program}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Quantity & Value Section */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Quantity & Value</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <FormField 
                name="quantity" 
                label="Quantity"
              >
                <input
                  id="quantity"
                  type="number"
                  value={formValues.quantity}
                  onChange={(e) => updateFormValue('quantity', e.target.value)}
                  min="1"
                  step="1"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 100"
                />
              </FormField>
              
              <FormField 
                name="unitPrice" 
                label="Unit Price (USD)"
              >
                <input
                  id="unitPrice"
                  type="number"
                  value={formValues.unitPrice}
                  onChange={(e) => updateFormValue('unitPrice', e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 25.50"
                />
              </FormField>
              
              <FormField 
                name="weight" 
                label="Weight (kg)"
              >
                <input
                  id="weight"
                  type="number"
                  value={formValues.weight}
                  onChange={(e) => updateFormValue('weight', e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 150.5"
                />
              </FormField>
            </div>
          </div>
          
          {/* Shipping Details Section */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Shipping Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField 
                name="transportMethod" 
                label="Transport Method"
              >
                <select
                  id="transportMethod"
                  value={formValues.transportMethod}
                  onChange={(e) => updateFormValue('transportMethod', e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {transportMethods.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </FormField>
              
              <div className="space-y-3">
                <FormField 
                  name="isHazardous" 
                  label=""
                >
                  <div className="flex items-center">
                    <input
                      id="isHazardous"
                      type="checkbox"
                      checked={formValues.isHazardous}
                      onChange={(e) => updateFormValue('isHazardous', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isHazardous" className="ml-2 block text-sm text-gray-700">
                      Hazardous Material
                    </label>
                  </div>
                </FormField>
                
                <FormField 
                  name="isPerishable" 
                  label=""
                >
                  <div className="flex items-center">
                    <input
                      id="isPerishable"
                      type="checkbox"
                      checked={formValues.isPerishable}
                      onChange={(e) => updateFormValue('isPerishable', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPerishable" className="ml-2 block text-sm text-gray-700">
                      Perishable Goods
                    </label>
                  </div>
                </FormField>
                
                <FormField 
                  name="useTradeAgreement" 
                  label=""
                >
                  <div className="flex items-center">
                    <input
                      id="useTradeAgreement"
                      type="checkbox"
                      checked={formValues.useTradeAgreement}
                      onChange={(e) => updateFormValue('useTradeAgreement', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="useTradeAgreement" className="ml-2 block text-sm text-gray-700">
                      Apply Trade Agreements (if available)
                    </label>
                  </div>
                </FormField>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={resetForm}
              className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Reset Form
            </button>
            
            <FormSubmitButton disableIfInvalid showScore>
              Calculate Tariffs
            </FormSubmitButton>
          </div>
        </form>
      </FormValidationProvider>
    </div>
  );
};

export default TariffAnalysisForm;
