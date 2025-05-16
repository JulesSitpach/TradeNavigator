import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { LanguageContext } from "@/contexts/LanguageContext";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, AlertCircle, XCircle, Download } from "lucide-react";
import "../../styles/cost-breakdown-form.css";

// Sample data matching the screenshot design
const sampleProduct = {
  name: "High-performance laptops, 13\" display, 32GB RAM, 1TB SSD",
  hsCode: "8486.10",
  category: "electronics",
  value: 3500,
  originCountry: "china",
  destinationCountry: "canada"
};

const samplePrograms = [
  {
    id: 1,
    name: "Foreign Trade Zone Program",
    description: "Duty deferral, reduction, or elimination by using designated foreign trade zones",
    type: "trade-zone",
    potentialSavings: 300,
    eligibilityStatus: "partially",
    requirementsMet: "2 of 3",
    processingTime: "4-8 weeks",
    percentageOfDeclaredValue: 60
  },
  {
    id: 2,
    name: "Duty Drawback Program",
    description: "Refund of duties paid on imported materials when those materials are exported in a finished product",
    type: "duty-drawback",
    potentialSavings: 495,
    eligibilityStatus: "eligible",
    requirementsMet: "All",
    processingTime: "6-10 weeks",
    percentageOfDeclaredValue: 90
  },
  {
    id: 3,
    name: "Duty Deferral Program",
    description: "Postpone payment of import duties until the goods are sold or otherwise disposed of",
    type: "duty-deferral",
    potentialSavings: 150,
    eligibilityStatus: "not-eligible",
    requirementsMet: "0 of 4",
    processingTime: "2-4 weeks",
    percentageOfDeclaredValue: 30
  }
];

const SpecialProgramsRedesigned = () => {
  const { t } = useContext(LanguageContext);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(1);

  // Get the selected program details
  const selectedProgramDetails = samplePrograms.find(program => program.id === selectedProgram);

  // Function to render the correct eligibility status icon and text
  const renderEligibilityStatus = (status: string) => {
    if (status === 'eligible') {
      return (
        <div className="status-indicator eligible">
          <CheckCircle className="h-5 w-5" />
          <span>Fully Eligible</span>
        </div>
      );
    } else if (status === 'partially') {
      return (
        <div className="status-indicator partially">
          <AlertCircle className="h-5 w-5" />
          <span>Partially Eligible</span>
        </div>
      );
    } else {
      return (
        <div className="status-indicator not-eligible">
          <XCircle className="h-5 w-5" />
          <span>Not Eligible</span>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 pb-12">
      <PageHeader
        title="Special Programs"
        description="Explore duty savings and special tariff programs"
        actions={[
          {
            label: "Export Report",
            icon: <Download className="h-4 w-4 mr-2" />,
            onClick: () => console.log("Export Report clicked"),
            variant: "default"
          }
        ]}
      />

      {/* Product Information Card */}
      <div className="product-info-card">
        <div className="product-title">{sampleProduct.name}</div>
        <div className="flex items-center gap-2">
          <span className="hs-code">HS Code: {sampleProduct.hsCode}</span>
          <span className="text-sm">• {sampleProduct.category}</span>
          <span className="text-sm">• Value: ${sampleProduct.value}</span>
        </div>
        
        <div className="origin-destination">
          <div className="country">
            <div className="text-sm font-medium uppercase mb-1">ORIGIN</div>
            <div>{sampleProduct.originCountry}</div>
          </div>
          <div className="arrow">
            <ArrowRight className="h-5 w-5" />
          </div>
          <div className="country">
            <div className="text-sm font-medium uppercase mb-1">DESTINATION</div>
            <div>{sampleProduct.destinationCountry}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Programs Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="bg-primary-blue text-white">
              <CardTitle>Available Programs</CardTitle>
              <CardDescription className="text-white opacity-90">
                Select a program to view details and eligibility
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div>
                {samplePrograms.map(program => (
                  <div
                    key={program.id}
                    className={`program-card cursor-pointer ${
                      selectedProgram === program.id ? 'border-primary-blue' : ''
                    }`}
                    onClick={() => setSelectedProgram(program.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="mb-2">
                          <span className={`program-tag ${program.type}`}>
                            {program.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </div>
                        <h3 className="program-title">{program.name}</h3>
                        <p className="program-description">{program.description}</p>
                      </div>
                      <div className="savings">
                        <span>${program.potentialSavings}</span>
                        <div className="text-xs text-dark-gray">Potential Savings</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Program Details Panel */}
        <div className="lg:col-span-2">
          {selectedProgramDetails && (
            <Card>
              <CardHeader className="bg-deep-blue text-white">
                <CardTitle>{selectedProgramDetails.name}</CardTitle>
                <CardDescription className="text-white opacity-90">
                  Duty deferral, reduction, or elimination by using designated foreign trade zones
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Eligibility Status */}
                {renderEligibilityStatus(selectedProgramDetails.eligibilityStatus)}
                <div className="text-sm text-dark-gray">
                  Your shipment meets {selectedProgramDetails.requirementsMet} requirements.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Potential Savings */}
                  <Card>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-sm text-dark-gray uppercase">Potential Savings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="value-metric savings">
                        <span className="currency">$</span>
                        {selectedProgramDetails.potentialSavings}
                      </div>
                      <div className="text-xs text-dark-gray">
                        {selectedProgramDetails.percentageOfDeclaredValue}% of declared value
                      </div>
                    </CardContent>
                  </Card>

                  {/* Processing Time */}
                  <Card>
                    <CardHeader className="pb-0">
                      <CardTitle className="text-sm text-dark-gray uppercase">Processing Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="value-metric">
                        {selectedProgramDetails.processingTime}
                      </div>
                      <div className="text-xs text-dark-gray">
                        Average processing time
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-deep-blue mb-2">Description</h3>
                  <p className="text-sm">
                    Foreign Trade Zones (FTZ) are secure areas under customs supervision that are generally 
                    considered outside the customs territory of the importing country for duty payment 
                    purposes. Using FTZs can result in duty deferral, reduction, or elimination.
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end">
                  <Button variant="outline" className="mr-3">Learn More</Button>
                  <Button>Apply for Program</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialProgramsRedesigned;