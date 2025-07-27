import { useState } from "react";
import { Plus, Edit2, Trash2, Settings, Save, X, Upload, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "./ProductCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: string[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateCategories: (categories: string[]) => void;
  customBanner?: string;
  onUpdateBanner: (banner: string) => void;
}

interface ProductForm {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  category: string;
}

export const AdminPanel = ({
  isOpen,
  onClose,
  products,
  categories,
  onUpdateProducts,
  onUpdateCategories,
  customBanner,
  onUpdateBanner,
}: AdminPanelProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings'>('products');
  const [editingProduct, setEditingProduct] = useState<ProductForm | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [bannerUrl, setBannerUrl] = useState(customBanner || '');

  const defaultProduct: ProductForm = {
    id: '',
    name: '',
    price: '',
    image: '',
    description: '',
    category: categories[0] || '',
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    if (!editingProduct.name || !editingProduct.price || !editingProduct.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(editingProduct.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isAddingProduct) {
        // Insert new product into Supabase
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: editingProduct.name,
            price: price,
            category: editingProduct.category,
            description: editingProduct.description,
            image_url: editingProduct.image
          })
          .select()
          .single();

        if (error) throw error;

        const newProduct: Product = {
          id: data.id,
          name: data.name,
          price: data.price,
          category: data.category,
          description: data.description || '',
          image: data.image_url || ''
        };

        onUpdateProducts([...products, newProduct]);
      } else {
        // Update existing product in Supabase
        const { error } = await supabase
          .from('products')
          .update({
            name: editingProduct.name,
            price: price,
            category: editingProduct.category,
            description: editingProduct.description,
            image_url: editingProduct.image
          })
          .eq('id', editingProduct.id);

        if (error) throw error;

        const updatedProduct: Product = {
          ...editingProduct,
          price,
        };

        onUpdateProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      }

      setEditingProduct(null);
      setIsAddingProduct(false);
      
      toast({
        title: "Success",
        description: `Product ${isAddingProduct ? 'added' : 'updated'} successfully!`,
      });
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      onUpdateProducts(products.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = async () => {
    if (newCategory && !categories.includes(newCategory)) {
      try {
        const { error } = await supabase
          .from('categories')
          .insert({ name: newCategory });

        if (error) throw error;

        onUpdateCategories([...categories, newCategory]);
        setNewCategory('');
        toast({
          title: "Success",
          description: "Category added successfully!",
        });
      } catch (error) {
        console.error('Error adding category:', error);
        toast({
          title: "Error",
          description: "Failed to add category. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (products.some(p => p.category === category)) {
      toast({
        title: "Cannot Delete",
        description: "This category contains products. Please move or delete them first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('name', category);

      if (error) throw error;

      onUpdateCategories(categories.filter(c => c !== category));
      toast({
        title: "Success",
        description: "Category deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBanner = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'banner_url', 
          value: bannerUrl 
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      onUpdateBanner(bannerUrl);
      toast({
        title: "Success",
        description: "Banner updated successfully!",
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        title: "Error",
        description: "Failed to update banner. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="admin-panel w-full max-w-2xl h-full overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6">
            {[
              { id: 'products', label: 'Products', icon: Plus },
              { id: 'categories', label: 'Categories', icon: Edit2 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "outline"}
                onClick={() => setActiveTab(id as any)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Manage Products</h3>
                <Button 
                  onClick={() => {
                    setEditingProduct(defaultProduct);
                    setIsAddingProduct(true);
                  }}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {editingProduct && (
                <Card className="p-4 mb-6 border-primary/20">
                  <h4 className="font-semibold mb-4">
                    {isAddingProduct ? 'Add New Product' : 'Edit Product'}
                  </h4>
                  <div className="space-y-4">
                    <Input
                      placeholder="Product Name"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Price (₹)"
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                      />
                      <select
                        className="px-3 py-2 border border-input rounded-md bg-background"
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      placeholder="Image URL"
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    />
                    <Textarea
                      placeholder="Description"
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProduct} className="btn-primary">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditingProduct(null);
                          setIsAddingProduct(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                {products.map(product => (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{product.name}</h4>
                          <Badge variant="secondary">{product.category}</Badge>
                          <Badge variant="outline">₹{product.price}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingProduct({
                              ...product,
                              price: product.price.toString(),
                            });
                            setIsAddingProduct(false);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Manage Categories</h3>
              
              <Card className="p-4 mb-6">
                <h4 className="font-semibold mb-4">Add New Category</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Category Name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button onClick={handleAddCategory} className="btn-primary">
                    Add
                  </Button>
                </div>
              </Card>

              <div className="space-y-3">
                {categories.map(category => (
                  <Card key={category} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{category}</h4>
                        <p className="text-sm text-muted-foreground">
                          {products.filter(p => p.category === category).length} products
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Settings</h3>
              
              <Card className="p-4 mb-6">
                <h4 className="font-semibold mb-4">Banner Image</h4>
                <div className="space-y-4">
                  <Input
                    placeholder="Banner Image URL"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                  />
                  <Button onClick={handleUpdateBanner} className="btn-primary">
                    <Upload className="h-4 w-4 mr-2" />
                    Update Banner
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-4">
                  <Palette className="h-5 w-5 inline mr-2" />
                  Theme Colors
                </h4>
                <p className="text-sm text-muted-foreground">
                  Theme customization coming soon! Currently using the fresh lime green and sky blue theme.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};