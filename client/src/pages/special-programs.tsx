import React from 'react';
import PageHeader from "@/components/common/PageHeader";
import SpecialPrograms from "@/components/special-programs/SpecialPrograms";

const SpecialProgramsPage: React.FC = () => {
  // Sample product data - in a real app, this would come from API or state
  const sampleProduct = {
    name: "High-performance laptops, 13\" display, 32GB RAM, 1TB SSD",
    hsCode: "8471.30",
    category: "electronics",
    value: 3500,
    origin: "China",
    destination: "Canada"
  };

  return (
    <>
      <PageHeader
        title="Special Programs"
        description="Explore duty savings opportunities through special tariff programs"
      />
      
      <SpecialPrograms
        productName={sampleProduct.name}
        hsCode={sampleProduct.hsCode}
        category={sampleProduct.category}
        value={sampleProduct.value}
        origin={sampleProduct.origin}
        destination={sampleProduct.destination}
        onExport={() => console.log("Export report")}
      />
    </>
  );
};

export default SpecialProgramsPage;