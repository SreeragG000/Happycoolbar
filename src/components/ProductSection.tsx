import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ProductCard, Product } from "./ProductCard";
import { Button } from "@/components/ui/button";

interface ProductSectionProps {
  title: string;
  products: Product[];
  isOpen: boolean;
  onToggle: () => void;
}

export const ProductSection = ({ title, products, isOpen, onToggle }: ProductSectionProps) => {
  return (
    <section className="mb-12">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-muted/50 rounded-2xl border border-border/50 mb-6 group"
      >
        <h2 className="section-header text-left mb-0">
          {title}
          <span className="ml-3 text-sm font-normal text-muted-foreground">
            ({products.length} items)
          </span>
        </h2>
        {isOpen ? (
          <ChevronUp className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
        ) : (
          <ChevronDown className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
        )}
      </Button>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 fade-in">
          {products.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              delay={index}
            />
          ))}
        </div>
      )}
    </section>
  );
};