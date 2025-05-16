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
import ShipmentForm from "@/components/products/ShipmentForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

const Shipments = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editShipmentId, setEditShipmentId] = useState<number | null>(null);
  const [deleteShipmentId, setDeleteShipmentId] = useState<number | null>(null);

  // Fetch shipments
  const { data: shipments, isLoading, error } = useQuery({
    queryKey: ['/api/shipments'],
  });

  // Fetch products for reference
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  // Delete shipment mutation
  const deleteShipmentMutation = useMutation({
    mutationFn: async (shipmentId: number) => {
      await apiRequest('DELETE', `/api/shipments/${shipmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shipments'] });
      toast({
        title: "Shipment deleted",
        description: "The shipment has been successfully deleted."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete shipment. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle shipment deletion
  const handleDeleteShipment = (shipmentId: number) => {
    deleteShipmentMutation.mutate(shipmentId);
    setDeleteShipmentId(null);
  };

  // Handle shipment analysis
  const handleAnalyzeShipment = (shipmentId: number) => {
    setLocation(`/product-analysis?shipmentId=${shipmentId}`);
  };

  // Get product name by product ID
  const getProductName = (productId: number) => {
    if (!products) return "Unknown product";
    const product = products.find((p: any) => p.id === productId);
    return product ? product.name : "Unknown product";
  };

  // Create analysis mutation
  const createAnalysisMutation = useMutation({
    mutationFn: async (shipmentId: number) => {
      const response = await apiRequest('POST', '/api/analysis', { shipmentId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/analysis'] });
      setLocation(`/product-analysis?analysisId=${data.id}`);
      toast({
        title: "Analysis created",
        description: "Cost analysis has been successfully calculated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate analysis. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Calculate analysis based on shipment
  const calculateAnalysis = (shipmentId: number) => {
    createAnalysisMutation.mutate(shipmentId);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        Error loading shipments. Please try again.
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Shipments"
        description="Manage your international shipments"
        actions={[
          {
            label: "Add Shipment",
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
          ) : !shipments || shipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="text-neutral-400 mb-4">
                <svg className="h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No shipments yet</h3>
              <p className="text-neutral-500 text-center max-w-md mb-6">
                Create your first shipment to calculate costs and optimize your international trade.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <FaPlus className="mr-2" />
                Add Your First Shipment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Transport Mode</TableHead>
                    <TableHead>Incoterm</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment: any) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">{getProductName(shipment.productId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {shipment.destinationCountry}
                        </Badge>
                      </TableCell>
                      <TableCell>{shipment.quantity}</TableCell>
                      <TableCell className="capitalize">{shipment.transportMode}</TableCell>
                      <TableCell>{shipment.incoterm}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => calculateAnalysis(shipment.id)}
                            className="bg-primary/5 hover:bg-primary/10 text-primary"
                          >
                            <FaCalculator className="mr-1" />
                            Analyze
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditShipmentId(shipment.id)}
                          >
                            <FaPen className="mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setDeleteShipmentId(shipment.id)}
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

      {/* Create Shipment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Shipment</DialogTitle>
          </DialogHeader>
          <ShipmentForm onSuccess={() => {
            setIsCreateDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['/api/shipments'] });
          }} />
        </DialogContent>
      </Dialog>

      {/* Edit Shipment Dialog */}
      <Dialog 
        open={editShipmentId !== null} 
        onOpenChange={(open) => !open && setEditShipmentId(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Shipment</DialogTitle>
          </DialogHeader>
          {editShipmentId && (
            <ShipmentForm 
              shipmentId={editShipmentId}
              onSuccess={() => {
                setEditShipmentId(null);
                queryClient.invalidateQueries({ queryKey: ['/api/shipments'] });
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteShipmentId !== null}
        onOpenChange={(open) => !open && setDeleteShipmentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shipment
              and any associated analysis data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteShipmentId && handleDeleteShipment(deleteShipmentId)}
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

export default Shipments;
