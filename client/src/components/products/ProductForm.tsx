import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FaCircleQuestion } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Extend the product schema for form validation
const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  hsCode: z.string().optional(),
  category: z.string().optional(),
  value: z.string().refine(val => !isNaN(parseFloat(val)), {
    message: "Value must be a number"
  }),
  weight: z.string().refine(val => !isNaN(parseFloat(val)), {
    message: "Weight must be a number"
  }),
  length: z.string().refine(val => !isNaN(parseFloat(val)), {
    message: "Length must be a number"
  }),
  width: z.string().refine(val => !isNaN(parseFloat(val)), {
    message: "Width must be a number"
  }),
  height: z.string().refine(val => !isNaN(parseFloat(val)), {
    message: "Height must be a number"
  }),
  originCountry: z.string(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  productId?: number;
  onSuccess?: () => void;
}

const ProductForm = ({ productId, onSuccess }: ProductFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // If productId is provided, fetch the product data
  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: productId ? [`/api/products/${productId}`] : null,
    enabled: !!productId
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      hsCode: "",
      category: "",
      value: "0",
      weight: "0",
      length: "0",
      width: "0",
      height: "0",
      originCountry: "CN",
    }
  });

  // Update form values when product data is loaded
  if (productData && !isProductLoading) {
    const formValues = {
      name: productData.name,
      description: productData.description || "",
      hsCode: productData.hsCode || "",
      category: productData.category || "",
      value: productData.value?.toString() || "0",
      weight: productData.weight?.toString() || "0",
      length: productData.length?.toString() || "0",
      width: productData.width?.toString() || "0",
      height: productData.height?.toString() || "0",
      originCountry: productData.originCountry || "CN",
    };
    
    // Only set values if they differ from current values
    Object.keys(formValues).forEach(key => {
      if (form.getValues(key as keyof ProductFormValues) !== formValues[key as keyof ProductFormValues]) {
        form.setValue(key as keyof ProductFormValues, formValues[key as keyof ProductFormValues]);
      }
    });
  }

  const onSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    try {
      // Convert string values to numbers
      const productPayload = {
        ...values,
        value: parseFloat(values.value),
        weight: parseFloat(values.weight),
        length: parseFloat(values.length),
        width: parseFloat(values.width),
        height: parseFloat(values.height),
      };

      if (productId) {
        // Update existing product
        await apiRequest('PUT', `/api/products/${productId}`, productPayload);
        toast({
          title: "Product updated",
          description: "Your product has been updated successfully."
        });
      } else {
        // Create new product
        await apiRequest('POST', '/api/products', productPayload);
        toast({
          title: "Product created",
          description: "Your product has been created successfully."
        });
        
        // Reset form
        form.reset();
      }
      
      // Invalidate products query
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving the product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-neutral-200">
      <CardHeader className="border-b border-neutral-200 px-5 py-4">
        <CardTitle className="text-lg font-medium text-neutral-900">Product Information</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hsCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">HS Code</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input {...field} className="w-full rounded-lg border border-neutral-300 px-3 py-2 pr-10" />
                      </FormControl>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <FaCircleQuestion className="text-neutral-400 hover:text-primary cursor-pointer" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Harmonized System (HS) code is an international nomenclature for classifying products for customs purposes.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="originCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">Country of Origin</FormLabel>
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
                        <SelectItem value="CN">China</SelectItem>
                        <SelectItem value="VN">Vietnam</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="KR">South Korea</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="MX">Mexico</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">Unit Value</FormLabel>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">$</span>
                      <FormControl>
                        <Input {...field} className="w-full rounded-lg border border-neutral-300 pl-7 pr-3 py-2" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">Category</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Weight (kg)</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">Length (cm)</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">Width (cm)</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">Height (cm)</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-4" 
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : productId ? "Update Product" : "Save Product"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
