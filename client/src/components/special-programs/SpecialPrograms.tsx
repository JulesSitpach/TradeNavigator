import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgramCard from './ProgramCard';
import { FaFileExport } from 'react-icons/fa6';

interface ProgramDetails {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  badgeText?: string;
  eligibilityStatus?: string;
  requirements?: string[];
  processingTime?: string;
  detailedDescription?: string;
}

interface SpecialProgramsProps {
  productName: string;
  hsCode: string;
  category: string;
  value: string | number;
  origin: string;
  destination: string;
  onExport?: () => void;
}

const SpecialPrograms: React.FC<SpecialProgramsProps> = ({
  productName,
  hsCode,
  category,
  value,
  origin,
  destination,
  onExport
}) => {
  // Sample program data - in a real app, this would come from an API
  const programs: ProgramDetails[] = [
    {
      id: 'ftz',
      title: 'Foreign Trade Zone Program',
      description: 'Duty deferral, reduction, or elimination by using designated foreign trade zones',
      potentialSavings: 300,
      badgeText: 'Free Trade Zone',
      eligibilityStatus: 'Partially Eligible',
      requirements: ['Located in designated FTZ', 'Proper documentation', 'Customs supervision'],
      processingTime: '4-8 weeks',
      detailedDescription: 'Foreign Trade Zones (FTZ) are secure areas under customs supervision that are generally considered outside the customs territory of the importing country for duty payment purposes. Using FTZs can result in duty deferral, reduction, or elimination.'
    },
    {
      id: 'drawback',
      title: 'Duty Drawback Program',
      description: 'Refund of duties paid on imported materials when those materials are exported in a finished product',
      potentialSavings: 495,
      badgeText: 'Duty Drawback',
      eligibilityStatus: 'Eligible',
      requirements: ['Documentation of imported materials', 'Proof of export', 'Timeline requirements'],
      processingTime: '6-12 weeks',
      detailedDescription: 'The Duty Drawback program allows importers to receive a refund of up to 99% of certain duties, taxes, and fees paid on imported merchandise that is subsequently exported or destroyed under customs supervision.'
    },
    {
      id: 'deferral',
      title: 'Duty Deferral Program',
      description: 'Postpone payment of import duties until the goods are sold or otherwise disposed of',
      potentialSavings: 150,
      badgeText: 'Duty Deferral',
      eligibilityStatus: 'Eligible',
      requirements: ['Bonded warehouse', 'Periodic reporting', 'Customs compliance'],
      processingTime: '2-4 weeks',
      detailedDescription: 'Duty deferral programs allow importers to delay payment of duties until the merchandise enters the commerce of the importing country, which can improve cash flow and provide financial benefits.'
    },
    {
      id: 'gsp',
      title: 'Generalized System of Preferences',
      description: 'Duty-free treatment for eligible products from designated beneficiary countries',
      potentialSavings: 500,
      badgeText: 'Duty Deferral',
      eligibilityStatus: 'Potentially Eligible',
      requirements: ['Country of origin qualification', 'Direct shipment documentation', '35% value-added requirement'],
      processingTime: '4-6 weeks',
      detailedDescription: 'The Generalized System of Preferences (GSP) is a preferential tariff system which provides tariff reduction on various products. The concept of GSP is to give development support to developing countries through trade.'
    }
  ];

  const [selectedProgram, setSelectedProgram] = useState<string | null>(programs[0].id);
  
  const getSelectedProgram = () => {
    return programs.find(program => program.id === selectedProgram) || programs[0];
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-blue-900">Special Programs</h2>
          <p className="text-sm text-gray-600">Explore duty savings and special tariff programs</p>
        </div>
        <Button 
          onClick={onExport}
          className="flex items-center gap-2"
        >
          <FaFileExport /> Export Report
        </Button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-grow">
            <h3 className="font-medium text-gray-900">{productName}</h3>
            <div className="text-sm text-gray-600">
              HS Code: <span className="font-medium">{hsCode}</span> • {category} • Value: {typeof value === 'number' ? `$${value}` : value}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500">ORIGIN</div>
              <div className="font-medium">{origin}</div>
            </div>
            <div className="text-blue-500">→</div>
            <div className="text-center">
              <div className="text-xs text-gray-500">DESTINATION</div>
              <div className="font-medium">{destination}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Available Programs</h3>
            <p className="text-sm text-gray-600 mb-4">Select a program to view details and eligibility</p>
            
            <div className="space-y-3">
              {programs.map(program => (
                <ProgramCard
                  key={program.id}
                  id={program.id}
                  title={program.title}
                  description={program.description}
                  potentialSavings={program.potentialSavings}
                  badgeText={program.badgeText}
                  isSelected={program.id === selectedProgram}
                  onClick={() => setSelectedProgram(program.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{getSelectedProgram().title}</h3>
            <p className="text-sm text-gray-600 mb-4">{getSelectedProgram().description}</p>

            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 rounded-full p-2 mr-3">
                  <div className="w-6 h-6 flex items-center justify-center text-yellow-600">
                    <span>i</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium">Eligibility Status:</div>
                  <div className="text-yellow-600">{getSelectedProgram().eligibilityStatus}</div>
                  <div className="text-sm text-gray-600">Your shipment meets 2 of 3 requirements.</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="border border-gray-200 rounded p-4">
                  <div className="text-sm text-gray-500 mb-1">POTENTIAL SAVINGS</div>
                  <div className="text-xl font-bold text-green-600">${getSelectedProgram().potentialSavings}</div>
                  <div className="text-xs text-gray-500">60% of declared value</div>
                </div>
                
                <div className="border border-gray-200 rounded p-4">
                  <div className="text-sm text-gray-500 mb-1">PROCESSING TIME</div>
                  <div className="text-xl font-medium">{getSelectedProgram().processingTime}</div>
                  <div className="text-xs text-gray-500">Average processing time</div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600">{getSelectedProgram().detailedDescription}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Requirements</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {getSelectedProgram().requirements?.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" className="mr-2">Learn More</Button>
              <Button>Apply for This Program</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialPrograms;