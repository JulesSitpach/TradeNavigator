import { useState } from "react";
import { FaPlus, FaPen, FaTrash, FaCalculator } from "react-icons/fa6";
import PageHeader from "@/components/common/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ProductForm from "@/components/products/ProductForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

const Products = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);

  // Fetch products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/products'],
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest('DELETE', `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle product deletion
  const handleDeleteProduct = (productId: number) => {
    deleteProductMutation.mutate(productId);
    setDeleteProductId(null);
  };

  // Handle product analysis
  const handleAnalyzeProduct = (productId: number) => {
    setLocation(`/product-analysis?productId=${productId}`);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        Error loading products. Please try again.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="My Products"
        description="Manage your products for international shipping"
        actions={[
          {
            label: "Add Product",
            icon: <FaPlus />,
            onClick: () => setIsCreateDialogOpen(true)
          }
        ]}
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="text-neutral-400 mb-4">
                <svg className="h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No products yet</h3>
              <p className="text-neutral-500 text-center max-w-md mb-6">
                Add your first product to get started with shipping cost analysis and trade planning.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <FaPlus className="mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>HS Code</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Weight (kg)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        {product.hsCode ? (
                          <Badge variant="outline" className="font-mono">
                            {product.hsCode}
                          </Badge>
                        ) : (
                          <span className="text-neutral-400 text-sm">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>{product.originCountry || <span className="text-neutral-400 text-sm">Unknown</span>}</TableCell>
                      <TableCell className="text-right">
                        {product.value 
                          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.value)
                          : <span className="text-neutral-400 text-sm">Not set</span>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {product.weight 
                          ? product.weight 
                          : <span className="text-neutral-400 text-sm">Not set</span>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAnalyzeProduct(product.id)}
                            className="bg-primary/5 hover:bg-primary/10 text-primary"
                          >
                            <FaCalculator className="mr-1" />
                            Analyze
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditProductId(product.id)}
                          >
                            <FaPen className="mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setDeleteProductId(product.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <FaTrash className="mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm onSuccess={() => {
            setIsCreateDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['/api/products'] });
          }} />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog 
        open={editProductId !== null} 
        onOpenChange={(open) => !open && setEditProductId(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editProductId && (
            <ProductForm 
              productId={editProductId}
              onSuccess={() => {
                setEditProductId(null);
                queryClient.invalidateQueries({ queryKey: ['/api/products'] });
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteProductId !== null}
        onOpenChange={(open) => !open && setDeleteProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and any associated shipment data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteProductId && handleDeleteProduct(deleteProductId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Products;
