import { useState, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ProductSection } from "@/components/ProductSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Product } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [customBanner, setCustomBanner] = useState<string>("");

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
        
        // Load saved sections state
        const savedSections = localStorage.getItem('happyCoolbar_openSections');
        if (savedSections) {
          setOpenSections(JSON.parse(savedSections));
        } else {
          // Initially open first category
          const initialSections = categoryNames.reduce((acc, cat) => {
            acc[cat] = cat === categoryNames[0];
            return acc;
          }, {} as Record<string, boolean>);
          setOpenSections(initialSections);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Save section state to localStorage (keep this for UX)
  useEffect(() => {
    localStorage.setItem('happyCoolbar_openSections', JSON.stringify(openSections));
  }, [openSections]);
  const toggleSection = (category: string) => {
    setOpenSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  const groupedProducts = categories.reduce((acc, category) => {
    acc[category] = products.filter(product => product.category === category);
    return acc;
  }, {} as Record<string, Product[]>);
  const handleScroll = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  return <div className="min-h-screen bg-background">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-40">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <HeroSection customBanner={customBanner} onExploreMenu={() => handleScroll('products')} onContactUs={() => handleScroll('footer')} />

      {/* Products Section */}
      <main id="products" className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">What We Offer</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Discover our selection of cool drinks, ice creams, fresh bakery items, and Gandhigram products.</p>
        </div>

        {categories.map(category => <ProductSection key={category} title={category} products={groupedProducts[category] || []} isOpen={openSections[category] || false} onToggle={() => toggleSection(category)} />)}
      </main>

      {/* Footer */}
      <footer id="footer" className="bg-muted/30 py-12 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              HappyCoolbar
            </h3>
            <p className="text-muted-foreground">
              Your favorite spot for fresh and delicious treats
            </p>
          </div>
          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <span>Pulimchode, Ramanattukara, Kozhikode, Kerala 673633</span>
            <span>📞 +91 9497119961</span>
            <span>🕒 10:00 AM - 12 PM</span>
          </div>
        </div>
      </footer>

    </div>;
};
export default Index;