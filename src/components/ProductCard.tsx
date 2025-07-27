import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  delay?: number;
}

export const ProductCard = ({ product, delay = 0 }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Card 
      className={`product-card fade-in group cursor-pointer`}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="relative overflow-hidden rounded-t-2xl">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">🥤</div>
              <div className="text-sm">Image not available</div>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
            ₹{product.price}
          </Badge>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {product.description}
        </p>
      </div>
    </Card>
  );
};