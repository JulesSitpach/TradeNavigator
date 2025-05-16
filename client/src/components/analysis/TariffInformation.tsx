import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { FaCircleInfo } from "react-icons/fa6";
import { Skeleton } from "@/components/ui/skeleton";

interface TariffData {
  hsCode: string;
  description: string;
  countries: {
    name: string;
    code: string;
    baseRate: number;
    specialPrograms: {
      name: string;
      rate: number;
    }[] | null;
    finalRate: number;
    highlight?: boolean;
  }[];
}

interface TariffInformationProps {
  data: TariffData | null;
  isLoading: boolean;
}

const TariffInformation = ({ data, isLoading }: TariffInformationProps) => {
  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
        <CardHeader className="border-b border-neutral-200 px-5 py-4">
          <CardTitle className="text-lg font-medium text-neutral-900">Tariff Information</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <Skeleton className="h-24 w-full mb-5" />
          <div className="overflow-x-auto">
            <Skeleton className="h-52 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
        <CardHeader className="border-b border-neutral-200 px-5 py-4">
          <CardTitle className="text-lg font-medium text-neutral-900">Tariff Information</CardTitle>
        </CardHeader>
        <CardContent className="p-5 flex justify-center items-center min-h-[200px]">
          <div className="text-center">
            <p className="text-neutral-500">No tariff information available</p>
            <p className="text-sm text-neutral-400 mt-2">
              Add product details with HS code to see tariff information
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-neutral-200 mb-6">
      <CardHeader className="border-b border-neutral-200 px-5 py-4">
        <CardTitle className="text-lg font-medium text-neutral-900">Tariff Information</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-5">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <FaCircleInfo className="text-primary" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-neutral-900">HS Code Detail: {data.hsCode}</h3>
              <p className="mt-1 text-sm text-neutral-600">{data.description}</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Country</TableHead>
                <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">Base Rate</TableHead>
                <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">Special Programs</TableHead>
                <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">Final Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.countries.map((country, index) => (
                <TableRow 
                  key={index}
                  className={country.highlight ? "bg-secondary-light" : ""}
                >
                  <TableCell className="whitespace-nowrap text-sm font-medium text-neutral-900">{country.name}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-right text-neutral-700">{country.baseRate.toFixed(2)}%</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-right">
                    {country.specialPrograms && country.specialPrograms.length > 0 ? (
                      <span className="text-secondary">
                        {country.specialPrograms.map(program => (
                          <div key={program.name}>{program.rate.toFixed(2)}% ({program.name})</div>
                        ))}
                      </span>
                    ) : (
                      <span className="text-neutral-500">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-right font-medium text-neutral-900">{country.finalRate.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TariffInformation;
