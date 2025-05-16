import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Info, Calculator } from "lucide-react";
import PageHeader from '@/components/common/PageHeader';
import HSCodeAssistant from '@/components/ai/HSCodeAssistant';
import '../../styles/cost-breakdown-form.css';

// Import country data for dropdown options
const countries = [
  { code: 'US', name: 'United States', isCPTPP: false },
  { code: 'CA', name: 'Canada', isCPTPP: true },
  { code: 'MX', name: 'Mexico', isCPTPP: false },
  { code: 'CN', name: 'China', isCPTPP: false },
  { code: 'JP', name: 'Japan', isCPTPP: true },
  { code: 'DE', name: 'Germany', isCPTPP: false },
  { code: 'AU', name: 'Australia', isCPTPP: true },
  { code: 'BR', name: 'Brazil', isCPTPP: false },
  { code: 'VN', name: 'Vietnam', isCPTPP: true },
  { code: 'GB', name: 'United Kingdom', isCPTPP: false },
  { code: 'SG', name: 'Singapore', isCPTPP: true },
  { code: 'MY', name: 'Malaysia', isCPTPP: true },
  { code: 'NZ', name: 'New Zealand', isCPTPP: true },
];

// Product categories
const productCategories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'textiles', label: 'Textiles & Apparel' },
  { value: 'automotive', label: 'Automotive Parts' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'chemicals', label: 'Chemicals & Pharmaceuticals' },
  { value: 'machinery', label: 'Machinery & Equipment' },
  { value: 'furniture', label: 'Furniture & Home Goods' },
  { value: 'toys', label: 'Toys & Games' },
];

// Transport Modes
const transportModes = [
  { value: 'ocean_fcl', label: 'Ocean (FCL)' },
  { value: 'ocean_lcl', label: 'Ocean (LCL)' },
  { value: 'air', label: 'Air Freight' },
  { value: 'road', label: 'Road Transport' },
  { value: 'rail', label: 'Rail Transport' },
  { value: 'multimodal', label: 'Multimodal Transport' },
];

// Incoterms
const incoterms = [
  { value: 'fob', label: 'FOB (Free On Board)' },
  { value: 'cif', label: 'CIF (Cost, Insurance & Freight)' },
  { value: 'exw', label: 'EXW (Ex Works)' },
  { value: 'ddp', label: 'DDP (Delivered Duty Paid)' },
  { value: 'fca', label: 'FCA (Free Carrier)' },
  { value: 'dap', label: 'DAP (Delivered At Place)' },
];

// Shipment Types
const shipmentTypes = [
  { value: 'lcl', label: 'Less than Container Load (LCL)' },
  { value: 'fcl_20', label: '20ft Full Container (FCL)' },
  { value: 'fcl_40', label: '40ft Full Container (FCL)' },
  { value: 'air_standard', label: 'Air Freight (Standard)' },
  { value: 'air_express', label: 'Air Freight (Express)' },
];

// Package Types
const packageTypes = [
  { value: 'pallets', label: 'Pallets' },
  { value: 'boxes', label: 'Boxes/Cartons' },
  { value: 'drums', label: 'Drums' },
  { value: 'crates', label: 'Crates' },
  { value: 'loose', label: 'Loose Cargo' },
];

// Currencies
const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CNY', label: 'CNY (¥)' },
];

interface FormData {
  productName: string;
  category: string;
  hsCode: string;
  originCountry: string;
  destinationCountry: string;
  quantity: string;
  unitValue: string;
  currency: string;
  weight: string;
  transportMode: string;
  incoterm: string;
  shipmentType: string;
  packageType: string;
}

const ProductInfoForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    category: '',
    hsCode: '',
    originCountry: '',
    destinationCountry: '',
    quantity: '',
    unitValue: '',
    currency: 'USD',
    weight: '',
    transportMode: '',
    incoterm: 'fob',
    shipmentType: '',
    packageType: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark field as completed if it has a value
    if (value) {
      const updatedCompleted = new Set(completedFields);
      updatedCompleted.add(field);
      setCompletedFields(updatedCompleted);
    } else {
      const updatedCompleted = new Set(completedFields);
      updatedCompleted.delete(field);
      setCompletedFields(updatedCompleted);
    }
    
    // Clear error for this field if any
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };
  
  // Handle HS code selection from the AI assistant
  const handleHsCodeSelection = (code: string) => {
    handleInputChange('hsCode', code);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    let isValid = true;

    // Required fields
    const requiredFields: (keyof FormData)[] = [
      'productName', 'category', 'originCountry', 'destinationCountry', 
      'quantity', 'unitValue', 'weight', 'transportMode', 'shipmentType'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
        isValid = false;
      }
    });

    // Numeric validation
    const numericFields: (keyof FormData)[] = ['quantity', 'unitValue', 'weight'];
    numericFields.forEach(field => {
      if (formData[field] && isNaN(Number(formData[field]))) {
        newErrors[field] = 'Must be a number';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Store form data in session storage for the cost breakdown page
      sessionStorage.setItem('productInfoData', JSON.stringify(formData));
      
      // Navigate to the cost breakdown page
      setLocation('/dashboard/cost-breakdown-complete');
    }
  };

  return (
    <div>
      <PageHeader
        title="Product Information"
        description="Enter details about your product to analyze trade costs"
        actions={[
          {
            label: "Browse Products",
            icon: <Info size={16} />,
            onClick: () => setLocation('/dashboard/products'),
            variant: "outline",
            href: "/dashboard/products"
          }
        ]}
      />

      <Card className="cost-breakdown-form">
        <CardHeader>
          <CardTitle>Product & Shipment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-col form-col-md-6">
                <div className="form-group">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    className={`form-control ${completedFields.has('productName') ? 'completed' : ''} ${errors.productName ? 'error' : ''}`}
                    placeholder="Enter product name"
                  />
                  {errors.productName && <span className="error-message">{errors.productName}</span>}
                </div>
              </div>

              <div className="form-col form-col-md-6">
                <div className="form-group">
                  <Label htmlFor="category">Product Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className={`form-control dropdown-select ${completedFields.has('category') ? 'completed' : ''} ${errors.category ? 'error' : ''}`}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-col form-col-md-6">
                <div className="form-group">
                  <Label htmlFor="hsCode">HS Code (if known)</Label>
                  <Input
                    id="hsCode"
                    value={formData.hsCode}
                    onChange={(e) => handleInputChange('hsCode', e.target.value)}
                    className={`form-control ${completedFields.has('hsCode') ? 'completed' : ''}`}
                    placeholder="e.g. 8471.30"
                  />
                  <span className="form-hint">Our AI can suggest codes if you don't know it</span>
                  
                  {/* HS Code AI Assistant - only shows suggestions when product description and category are provided */}
                  {formData.productName && formData.category && (
                    <HSCodeAssistant 
                      productDescription={formData.productName}
                      category={formData.category}
                      onSelectHSCode={handleHsCodeSelection}
                    />
                  )}
                </div>
              </div>

              <div className="form-col form-col-md-3">
                <div className="form-group">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className={`form-control ${completedFields.has('quantity') ? 'completed' : ''} ${errors.quantity ? 'error' : ''}`}
                    placeholder="e.g. 100"
                  />
                  {errors.quantity && <span className="error-message">{errors.quantity}</span>}
                </div>
              </div>

              <div className="form-col form-col-md-3">
                <div className="form-group">
                  <Label htmlFor="weight">Total Weight (kg)</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className={`form-control ${completedFields.has('weight') ? 'completed' : ''} ${errors.weight ? 'error' : ''}`}
                    placeholder="e.g. 500"
                  />
                  {errors.weight && <span className="error-message">{errors.weight}</span>}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-col form-col-md-6">
                <div className="form-group">
                  <Label htmlFor="unitValue">Unit Value</Label>
                  <div className="relative">
                    <Input
                      id="unitValue"
                      value={formData.unitValue}
                      onChange={(e) => handleInputChange('unitValue', e.target.value)}
                      className={`form-control ${completedFields.has('unitValue') ? 'completed' : ''} ${errors.unitValue ? 'error' : ''}`}
                      placeholder="e.g. 25.50"
                    />
                    {errors.unitValue && <span className="error-message">{errors.unitValue}</span>}
                  </div>
                </div>
              </div>

              <div className="form-col form-col-md-6">
                <div className="form-group">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger className={`form-control dropdown-select ${completedFields.has('currency') ? 'completed' : ''}`}>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-col form-col-md-6">
                <div className="form-group">
                  <Label htmlFor="originCountry">Origin Country</Label>
                  <Select
                    value={formData.originCountry}
                    onValueChange={(value) => handleInputChange('originCountry', value)}
                  >
                    <SelectTrigger className={`form-control dropdown-select ${completedFields.has('originCountry') ? 'completed' : ''} ${errors.originCountry ? 'error' : ''}`}>
                      <SelectValue placeholder="Select origin country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.sort((a, b) => a.name.localeCompare(b.name)).map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                          {country.isCPTPP && <span className="cptpp-indicator">CPTPP</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.originCountry && <span className="error-message">{errors.originCountry}</span>}
                </div>
              </div>

              <div className="form-col form-col-md-6">
                <div className="form-group">
                  <Label htmlFor="destinationCountry">Destination Country</Label>
                  <Select
                    value={formData.destinationCountry}
                    onValueChange={(value) => handleInputChange('destinationCountry', value)}
                  >
                    <SelectTrigger className={`form-control dropdown-select ${completedFields.has('destinationCountry') ? 'completed' : ''} ${errors.destinationCountry ? 'error' : ''}`}>
                      <SelectValue placeholder="Select destination country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.sort((a, b) => a.name.localeCompare(b.name)).map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                          {country.isCPTPP && <span className="cptpp-indicator">CPTPP</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.destinationCountry && <span className="error-message">{errors.destinationCountry}</span>}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-col form-col-md-4">
                <div className="form-group">
                  <Label htmlFor="transportMode">Transport Mode</Label>
                  <Select
                    value={formData.transportMode}
                    onValueChange={(value) => handleInputChange('transportMode', value)}
                  >
                    <SelectTrigger className={`form-control dropdown-select ${completedFields.has('transportMode') ? 'completed' : ''} ${errors.transportMode ? 'error' : ''}`}>
                      <SelectValue placeholder="Select transport mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {transportModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.transportMode && <span className="error-message">{errors.transportMode}</span>}
                </div>
              </div>

              <div className="form-col form-col-md-4">
                <div className="form-group">
                  <Label htmlFor="incoterm">Incoterm</Label>
                  <Select
                    value={formData.incoterm}
                    onValueChange={(value) => handleInputChange('incoterm', value)}
                  >
                    <SelectTrigger className={`form-control dropdown-select ${completedFields.has('incoterm') ? 'completed' : ''}`}>
                      <SelectValue placeholder="Select incoterm" />
                    </SelectTrigger>
                    <SelectContent>
                      {incoterms.map((term) => (
                        <SelectItem key={term.value} value={term.value}>
                          {term.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-col form-col-md-6">
                <div className="form-group">
                  <Label htmlFor="shipmentType">Shipment Type</Label>
                  <Select
                    value={formData.shipmentType}
                    onValueChange={(value) => handleInputChange('shipmentType', value)}
                  >
                    <SelectTrigger className={`form-control dropdown-select ${completedFields.has('shipmentType') ? 'completed' : ''} ${errors.shipmentType ? 'error' : ''}`}>
                      <SelectValue placeholder="Select shipment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {shipmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.shipmentType && <span className="error-message">{errors.shipmentType}</span>}
                </div>
              </div>

              <div className="form-col form-col-md-6">
                <div className="form-group">
                  <Label htmlFor="packageType">Package Type</Label>
                  <Select
                    value={formData.packageType}
                    onValueChange={(value) => handleInputChange('packageType', value)}
                  >
                    <SelectTrigger className={`form-control dropdown-select ${completedFields.has('packageType') ? 'completed' : ''}`}>
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent>
                      {packageTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" className="calculate-button">
                <Calculator size={16} />
                Calculate Cost Breakdown
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductInfoForm;