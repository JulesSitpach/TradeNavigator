import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaShip, FaTruck, FaPlane } from "react-icons/fa6";
import { Skeleton } from "@/components/ui/skeleton";

interface ShippingOption {
  id: string;
  name: string;
  cost: number;
  transitTime: {
    min: number;
    max: number;
  };
  details: {
    freightCost: number;
    insurance: number;
    handlingFees: number;
  };
  route: string;
  carrier: string;
  isRecommended?: boolean;
  transportIcon: 'ship' | 'plane' | 'truck';
}

interface ShippingOptionsProps {
  options: ShippingOption[] | null;
  isLoading: boolean;
  onSelectOption: (optionId: string) => void;
  selectedOptionId?: string;
  currency?: string;
}

const ShippingOptions = ({ options, isLoading, onSelectOption, selectedOptionId, currency = 'USD' }: ShippingOptionsProps) => {
  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-neutral-200">
        <CardHeader className="border-b border-neutral-200 px-5 py-4">
          <CardTitle className="text-lg font-medium text-neutral-900">Shipping Options</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-72 w-full rounded-lg" />
            <Skeleton className="h-72 w-full rounded-lg" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg mt-6" />
        </CardContent>
      </Card>
    );
  }

  if (!options || options.length === 0) {
    return (
      <Card className="bg-white shadow-sm border border-neutral-200">
        <CardHeader className="border-b border-neutral-200 px-5 py-4">
          <CardTitle className="text-lg font-medium text-neutral-900">Shipping Options</CardTitle>
        </CardHeader>
        <CardContent className="p-5 flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <p className="text-neutral-500 mb-2">No shipping options available</p>
            <p className="text-sm text-neutral-400">
              Add product and shipment details to see shipping options
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getIcon = (type: 'ship' | 'plane' | 'truck') => {
    switch (type) {
      case 'ship':
        return <FaShip className="text-primary-600 mr-2" />;
      case 'plane':
        return <FaPlane className="text-primary-600 mr-2" />;
      case 'truck':
        return <FaTruck className="text-primary-600 mr-2" />;
      default:
        return <FaShip className="text-primary-600 mr-2" />;
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-neutral-200">
      <CardHeader className="border-b border-neutral-200 px-5 py-4">
        <CardTitle className="text-lg font-medium text-neutral-900">Shipping Options</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.slice(0, 2).map((option) => (
            <div 
              key={option.id}
              className={`border rounded-lg p-4 relative ${
                option.isRecommended 
                  ? 'border-primary-200 bg-primary-50' 
                  : 'border-neutral-200 bg-white'
              } ${
                selectedOptionId === option.id
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
            >
              {option.isRecommended && (
                <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-full">
                  Recommended
                </div>
              )}
              <h3 className="text-lg font-medium text-neutral-900">{option.name}</h3>
              <div className="flex justify-between items-baseline mt-2 mb-4">
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(option.cost)}
                </span>
                <span className="text-sm text-neutral-500">
                  {option.transitTime.min}-{option.transitTime.max} days
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Freight cost:</span>
                  <span className="text-neutral-800 font-medium">{formatCurrency(option.details.freightCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Insurance:</span>
                  <span className="text-neutral-800 font-medium">{formatCurrency(option.details.insurance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Handling fees:</span>
                  <span className="text-neutral-800 font-medium">{formatCurrency(option.details.handlingFees)}</span>
                </div>
              </div>
              
              <div className="flex items-center text-sm mb-2">
                {getIcon(option.transportIcon)}
                <span className="text-neutral-700">{option.route}</span>
              </div>
              
              <div className="flex items-center text-sm">
                {getIcon(option.transportIcon)}
                <span className="text-neutral-700">{option.carrier}</span>
              </div>
              
              <Button 
                onClick={() => onSelectOption(option.id)}
                className={`mt-4 w-full ${
                  option.isRecommended 
                    ? 'border-primary-600 text-primary-600 bg-white hover:bg-primary-50' 
                    : 'border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50'
                }`}
                variant={selectedOptionId === option.id ? "default" : "outline"}
              >
                {selectedOptionId === option.id ? "Selected" : "Select Option"}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 bg-neutral-50 p-2 rounded-lg h-64 overflow-hidden">
          <div className="relative w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1080&amp;h=400" 
              alt="Global shipping routes visualization" 
              className="w-full h-full object-cover rounded opacity-70"
            />
            <div className="absolute bottom-4 right-4 bg-white bg-opacity-80 px-3 py-1 rounded text-xs text-neutral-500">
              International trade routes visualization
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingOptions;
