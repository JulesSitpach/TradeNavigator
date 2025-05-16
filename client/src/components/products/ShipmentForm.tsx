import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FaCircleQuestion } from "react-icons/fa6";

// Shipment form validation schema
const shipmentFormSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  destinationCountry: z.string().min(1, "Destination country is required"),
  quantity: z.string().refine(val => !isNaN(parseInt(val)), {
    message: "Quantity must be a number"
  }),
  transportMode: z.string().min(1, "Transport mode is required"),
  incoterm: z.string().min(1, "Incoterm is required"),
});

type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;

interface ShipmentFormProps {
  shipmentId?: number;
  onSuccess?: () => void;
  onCalculate?: (shipmentId: number) => void;
}

const ShipmentForm = ({ shipmentId, onSuccess, onCalculate }: ShipmentFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products for dropdown
  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  // If shipmentId is provided, fetch the shipment data
  const { data: shipmentData, isLoading: isShipmentLoading } = useQuery({
    queryKey: shipmentId ? [`/api/shipments/${shipmentId}`] : null,
    enabled: !!shipmentId
  });

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      productId: "",
      destinationCountry: "US",
      quantity: "500",
      transportMode: "sea",
      incoterm: "FOB",
    }
  });

  // Update form values when shipment data is loaded
  if (shipmentData && !isShipmentLoading) {
    const formValues = {
      productId: shipmentData.productId.toString(),
      destinationCountry: shipmentData.destinationCountry || "US",
      quantity: shipmentData.quantity?.toString() || "500",
      transportMode: shipmentData.transportMode || "sea",
      incoterm: shipmentData.incoterm || "FOB",
    };
    
    // Only set values if they differ from current values
    Object.keys(formValues).forEach(key => {
      if (form.getValues(key as keyof ShipmentFormValues) !== formValues[key as keyof ShipmentFormValues]) {
        form.setValue(key as keyof ShipmentFormValues, formValues[key as keyof ShipmentFormValues]);
      }
    });
  }

  const onSubmit = async (values: ShipmentFormValues) => {
    setIsLoading(true);
    try {
      // Convert string values to numbers
      const shipmentPayload = {
        ...values,
        productId: parseInt(values.productId),
        quantity: parseInt(values.quantity),
        packageDetails: {} // Add package details if needed
      };

      let response;
      if (shipmentId) {
        // Update existing shipment
        response = await apiRequest('PUT', `/api/shipments/${shipmentId}`, shipmentPayload);
        toast({
          title: "Shipment updated",
          description: "Your shipment has been updated successfully."
        });
      } else {
        // Create new shipment
        response = await apiRequest('POST', '/api/shipments', shipmentPayload);
        toast({
          title: "Shipment created",
          description: "Your shipment has been created successfully."
        });
        
        // Reset form for new entries
        if (!onCalculate) {
          form.reset();
        }
      }
      
      // Invalidate shipments query
      queryClient.invalidateQueries({ queryKey: ['/api/shipments'] });
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
      
      // Call onCalculate if provided, passing the shipment ID
      if (onCalculate) {
        const shipmentId = shipmentId || response.id;
        onCalculate(shipmentId);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving the shipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-neutral-200">
      <CardHeader className="border-b border-neutral-200 px-5 py-4">
        <CardTitle className="text-lg font-medium text-neutral-900">Shipment Details</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!shipmentId && (
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">Product</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full rounded-lg border border-neutral-300">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isProductsLoading ? (
                          <SelectItem value="loading">Loading products...</SelectItem>
                        ) : products?.length > 0 ? (
                          products.map((product: any) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none">No products available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="destinationCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Destination Country</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full rounded-lg border border-neutral-300">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="MX">Mexico</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Quantity</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="transportMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Shipping Method</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full rounded-lg border border-neutral-300">
                        <SelectValue placeholder="Select shipping method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sea">Sea Freight</SelectItem>
                      <SelectItem value="air">Air Freight</SelectItem>
                      <SelectItem value="road">Road Transport</SelectItem>
                      <SelectItem value="rail">Rail Transport</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="incoterm"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel className="text-sm font-medium text-neutral-700">Incoterm</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <FaCircleQuestion className="text-neutral-400 hover:text-primary cursor-pointer" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            International Commercial Terms (Incoterms) define the responsibilities of seller and buyer in international transactions.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full rounded-lg border border-neutral-300">
                        <SelectValue placeholder="Select incoterm" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                      <SelectItem value="CIF">CIF - Cost, Insurance, Freight</SelectItem>
                      <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                      <SelectItem value="DAP">DAP - Delivered at Place</SelectItem>
                      <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full mt-4 flex items-center justify-center" 
              disabled={isLoading}
            >
              {isLoading ? 
                "Saving..." : 
                onCalculate ? 
                  "Calculate Costs" : 
                  shipmentId ? 
                    "Update Shipment" : 
                    "Create Shipment"
              }
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ShipmentForm;
