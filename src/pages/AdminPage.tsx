import { useState, useEffect } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { Product } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";

const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [customBanner, setCustomBanner] = useState<string>("");
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at');
        
        if (productsError) throw productsError;
        
        // Convert Supabase products to our Product type
        const formattedProducts: Product[] = productsData.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          description: p.description || '',
          image: p.image_url || ''
        }));
        
        setProducts(formattedProducts);
        
        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('name')
          .order('created_at');
          
        if (categoriesError) throw categoriesError;
        
        const categoryNames = categoriesData.map(c => c.name);
        setCategories(categoryNames);
        
        // Load banner setting
        const { data: bannerData, error: bannerError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'banner_url')
          .maybeSingle();
          
        if (!bannerError && bannerData) {
          setCustomBanner(bannerData.value || '');
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    // Check admin auth from localStorage
    const savedAdminAuth = localStorage.getItem('happyCoolbar_adminAuth');
    if (savedAdminAuth === 'sreeraggopinath0@gmail.com') {
      setIsAdminAuthorized(true);
      loadData();
    }
  }, []);

  // Update products and categories functions to save to Supabase
  const updateProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
    // Supabase updates will be handled by AdminPanel component
  };

  const updateCategories = async (newCategories: string[]) => {
    setCategories(newCategories);
    // Supabase updates will be handled by AdminPanel component
  };

  const updateBanner = async (newBanner: string) => {
    setCustomBanner(newBanner);
    // Supabase updates will be handled by AdminPanel component
  };

  const handleAdminAccess = async () => {
    const email = prompt('Enter your email for admin access:');
    if (email === 'sreeraggopinath0@gmail.com') {
      setIsAdminAuthorized(true);
      localStorage.setItem('happyCoolbar_adminAuth', email);
      
      // Load data after authorization
      try {
        // Load products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at');
        
        if (productsError) throw productsError;
        
        const formattedProducts: Product[] = productsData.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          description: p.description || '',
          image: p.image_url || ''
        }));
        
        setProducts(formattedProducts);
        
        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('name')
          .order('created_at');
          
        if (categoriesError) throw categoriesError;
        
        const categoryNames = categoriesData.map(c => c.name);
        setCategories(categoryNames);
        
        // Load banner setting
        const { data: bannerData, error: bannerError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'banner_url')
          .maybeSingle();
          
        if (!bannerError && bannerData) {
          setCustomBanner(bannerData.value || '');
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
      }
    } else {
      alert('Access denied. Invalid email.');
    }
  };

  if (!isAdminAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <button 
            onClick={handleAdminAccess}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Enter Admin Credentials
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminPanel
      isOpen={true}
      onClose={() => window.history.back()}
      products={products}
      categories={categories}
      onUpdateProducts={updateProducts}
      onUpdateCategories={updateCategories}
      customBanner={customBanner}
      onUpdateBanner={updateBanner}
    />
  );
};

export default AdminPage;