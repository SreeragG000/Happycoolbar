import { useState } from "react";
import heroBanner from "@/assets/hero-banner.jpg";

interface HeroSectionProps {
  customBanner?: string;
  onExploreMenu?: () => void;
  onContactUs?: () => void;
}

export const HeroSection = ({ customBanner, onExploreMenu, onContactUs }: HeroSectionProps) => {
  const [imageError, setImageError] = useState(false);
  const bannerImage = customBanner || heroBanner;

  console.log("HeroSection rendering - icon should be visible");

  return (
    <section className="hero-section relative py-20 px-6">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        {!imageError ? (
          <img
            src={bannerImage}
            alt="HappyCoolbar Shop"
            className="w-full h-full object-cover opacity-20"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="fade-in">
          <div className="flex items-center justify-center mb-6">
            <span className="text-5xl float-animation">🥤</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6 fade-in delay-300">
            HappyCoolbar
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed fade-in delay-400">
            Your favorite spot for refreshing drinks, delicious ice creams, and tasty snacks. 
            Fresh, cool, and always delightful!
          </p>
          <div className="bg-primary/10 dark:bg-primary/20 rounded-2xl p-4 mb-8 inline-block border border-primary/20 scale-in delay-500">
            <p className="text-lg font-medium text-primary dark:text-primary-glow">
              🌾 GandhiGramam Products Available Here! 🌾
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Fresh, organic, and locally sourced products
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in delay-600">
            <button className="btn-primary" onClick={onExploreMenu}>
              Explore Menu
            </button>
            <button className="btn-secondary" onClick={onContactUs}>
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/10 rounded-full blur-lg"></div>
    </section>
  );
};
