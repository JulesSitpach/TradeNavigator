import { useContext } from "react";
import { LanguageContext } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CostSummaryTableProps {
  productName: string;
  hsCode: string;
  originCountry: string;
  destinationCountry: string;
  quantity: number;
  components: {
    name: string;
    value: number;
    percentage: number;
  }[];
  totalCost: number;
  currency: string;
}

const CostSummaryTable: React.FC<CostSummaryTableProps> = ({
  productName,
  hsCode,
  originCountry,
  destinationCountry,
  quantity,
  components,
  totalCost,
  currency,
}) => {
  const { t } = useContext(LanguageContext);

  // Format currency with proper symbols
  const formatCurrency = (amount: number, curr = currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-white shadow-sm border border-neutral-200">
        <CardHeader className="px-4 py-3 border-b border-neutral-200">
          <CardTitle className="text-lg font-medium text-neutral-900">
            Trade Cost Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xs text-neutral-500 p-4 bg-neutral-50">
            <p>The Trade Cost Summary shows detailed costs per item, total freight charges, and estimated duties. All values are shown in {currency} and may vary based on current exchange rates.</p>
          </div>

          <table className="w-full">
            <tbody className="divide-y divide-neutral-200 text-sm">
              <tr>
                <td className="px-4 py-3 text-neutral-700 font-medium">Product Name</td>
                <td className="px-4 py-3 text-neutral-900">{productName}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-neutral-700 font-medium">HS Code</td>
                <td className="px-4 py-3 text-neutral-900">{hsCode}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-neutral-700 font-medium">Origin</td>
                <td className="px-4 py-3 text-neutral-900">{originCountry}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-neutral-700 font-medium">Destination</td>
                <td className="px-4 py-3 text-neutral-900">{destinationCountry}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-neutral-700 font-medium">Quantity</td>
                <td className="px-4 py-3 text-neutral-900">{quantity} units</td>
              </tr>
              
              {components.map((component, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-neutral-700 font-medium">{component.name}</td>
                  <td className="px-4 py-3 text-neutral-900">{formatCurrency(component.value)}</td>
                </tr>
              ))}
              
              <tr className="bg-neutral-50 font-semibold">
                <td className="px-4 py-3 text-neutral-800">Total Landed Cost</td>
                <td className="px-4 py-3 text-neutral-900">{formatCurrency(totalCost)}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostSummaryTable;