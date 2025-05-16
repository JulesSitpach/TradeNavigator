import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgramCard from './ProgramCard';
import { FaFileExport, FaCircleNotch } from 'react-icons/fa6';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Country {
  id: number;
  code: string;
  name: string;
  region: string;
  isOrigin: boolean;
  isDestination: boolean;
  description: string;
}

interface SpecialProgram {
  id: number;
  name: string;
  countryId: number;
  description: string;
  eligibilityCriteria?: string;
  applicationProcess?: string;
  potentialSavings?: number;
  limitations?: string;
  programType?: string;
}

interface ProgramDetails {
  id: string | number;
  title: string;
  description: string;
  potentialSavings: number;
  badgeText?: string;
  eligibilityStatus?: string;
  requirements?: string[];
  processingTime?: string;
  detailedDescription?: string;
  programType?: string;
  limitations?: string;
  applicationProcess?: string;
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
  // Get countries from API
  const { data: countries, isLoading: loadingCountries } = useQuery<Country[]>({
    queryKey: ['/api/countries'],
  });

  // State for selected origin and destination countries
  const [originCountry, setOriginCountry] = useState<string>(origin || "CN");
  const [destinationCountry, setDestinationCountry] = useState<string>(destination || "CA");
  
  useEffect(() => {
    if (origin) setOriginCountry(origin);
    if (destination) setDestinationCountry(destination);
  }, [origin, destination]);

  // Get special programs from API based on destination country
  const { data: specialPrograms, isLoading: loadingPrograms } = useQuery<SpecialProgram[]>({
    queryKey: ['/api/special-programs', destinationCountry],
    enabled: !!destinationCountry,
  });
  
  // Convert API data to program details format
  const mapProgramsToDetails = (programs: SpecialProgram[] | undefined): ProgramDetails[] => {
    if (!programs || programs.length === 0) {
      return [];
    }
    
    return programs.map(program => ({
      id: program.id,
      title: program.name,
      description: program.description || '',
      potentialSavings: program.potentialSavings || 0,
      badgeText: program.programType,
      eligibilityStatus: program.eligibilityCriteria ? 'Potentially Eligible' : 'Eligibility Unknown',
      requirements: program.eligibilityCriteria ? program.eligibilityCriteria.split('. ') : [],
      processingTime: program.applicationProcess ? '4-8 weeks' : 'Varies',
      detailedDescription: program.description || '',
      programType: program.programType,
      limitations: program.limitations,
      applicationProcess: program.applicationProcess
    }));
  };
  
  const programs = mapProgramsToDetails(specialPrograms);

  // Set initial selected program when programs data loads
  const [selectedProgram, setSelectedProgram] = useState<string | number | null>(null);
  
  useEffect(() => {
    if (programs && programs.length > 0 && !selectedProgram) {
      setSelectedProgram(programs[0].id);
    }
  }, [programs, selectedProgram]);
  
  const getSelectedProgram = () => {
    if (!programs || programs.length === 0) {
      return {
        id: 'loading',
        title: 'Loading...',
        description: 'Please wait while we load program details',
        potentialSavings: 0,
        requirements: []
      };
    }
    return programs.find(program => program.id === selectedProgram) || programs[0];
  };

  // Get country name from code
  const getCountryName = (code: string) => {
    if (!countries) return code;
    const country = countries.find(c => c.code === code);
    return country ? country.name : code;
  };

  // Handle country selection change
  const handleOriginChange = (value: string) => {
    setOriginCountry(value);
  };

  const handleDestinationChange = (value: string) => {
    setDestinationCountry(value);
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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <h3 className="font-medium text-gray-900">{productName}</h3>
            <div className="text-sm text-gray-600">
              HS Code: <span className="font-medium">{hsCode}</span> • {category} • Value: {typeof value === 'number' ? `$${value}` : value}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-44">
              <Label htmlFor="origin-country" className="text-xs text-gray-500">ORIGIN</Label>
              {loadingCountries ? (
                <div className="h-10 flex items-center justify-center">
                  <FaCircleNotch className="animate-spin text-blue-500" />
                </div>
              ) : (
                <Select value={originCountry} onValueChange={handleOriginChange}>
                  <SelectTrigger id="origin-country" className="w-full">
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries?.filter(c => c.isOrigin).map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="text-blue-500 hidden md:block">→</div>
            
            <div className="w-full md:w-44">
              <Label htmlFor="destination-country" className="text-xs text-gray-500">DESTINATION</Label>
              {loadingCountries ? (
                <div className="h-10 flex items-center justify-center">
                  <FaCircleNotch className="animate-spin text-blue-500" />
                </div>
              ) : (
                <Select value={destinationCountry} onValueChange={handleDestinationChange}>
                  <SelectTrigger id="destination-country" className="w-full">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries?.filter(c => c.isDestination).map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Available Programs</h3>
            <p className="text-sm text-gray-600 mb-4">
              {loadingPrograms ? 'Loading programs...' : 
                programs.length > 0 
                  ? `${programs.length} program${programs.length !== 1 ? 's' : ''} available for ${getCountryName(destinationCountry)}`
                  : `No special programs found for ${getCountryName(destinationCountry)}`
              }
            </p>
            
            {loadingPrograms ? (
              <div className="flex justify-center py-10">
                <FaCircleNotch className="animate-spin text-blue-500 text-2xl" />
              </div>
            ) : (
              <div className="space-y-3">
                {programs.length > 0 ? (
                  programs.map(program => (
                    <ProgramCard
                      key={program.id}
                      id={program.id}
                      title={program.title}
                      description={program.description}
                      potentialSavings={program.potentialSavings}
                      badgeText={program.programType}
                      isSelected={program.id === selectedProgram}
                      onClick={() => setSelectedProgram(program.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No programs available. Try selecting a different destination country.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          {loadingPrograms || programs.length === 0 ? (
            <div className="bg-blue-50 p-4 rounded-lg h-full flex flex-col items-center justify-center text-gray-500">
              {loadingPrograms ? (
                <>
                  <FaCircleNotch className="animate-spin text-blue-500 text-2xl mb-4" />
                  <p>Loading program details...</p>
                </>
              ) : (
                <>
                  <p className="mb-2">No program details available</p>
                  <p className="text-sm">Select a different destination country to explore available programs</p>
                </>
              )}
            </div>
          ) : (
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
                    <div className="text-sm text-gray-600">Additional verification may be required.</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="border border-gray-200 rounded p-4">
                    <div className="text-sm text-gray-500 mb-1">POTENTIAL SAVINGS</div>
                    <div className="text-xl font-bold text-green-600">${getSelectedProgram().potentialSavings}</div>
                    {getSelectedProgram().potentialSavings > 0 && (
                      <div className="text-xs text-gray-500">
                        {((getSelectedProgram().potentialSavings / Number(value)) * 100).toFixed(1)}% of declared value
                      </div>
                    )}
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

                {getSelectedProgram().requirements && getSelectedProgram().requirements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {getSelectedProgram().requirements?.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {getSelectedProgram().limitations && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Limitations</h4>
                    <p className="text-sm text-gray-600">{getSelectedProgram().limitations}</p>
                  </div>
                )}

                {getSelectedProgram().applicationProcess && (
                  <div>
                    <h4 className="font-medium mb-2">Application Process</h4>
                    <p className="text-sm text-gray-600">{getSelectedProgram().applicationProcess}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">Learn More</Button>
                <Button>Apply for This Program</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialPrograms;