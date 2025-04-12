
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ChevronLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
  titleColor?: string;
  subtitle?: string;
}

const Layout = ({ 
  children, 
  showBackButton = true, 
  title = "Krushi Pravah", 
  titleColor = "text-orange-600",
  subtitle 
}: LayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/10 via-white to-green-500/10">
      <header className="border-b border-orange-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="hover:bg-orange-100"
              >
                <ChevronLeft className="h-5 w-5 text-orange-600" />
              </Button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                <span className={titleColor}>{title}</span>
              </h1>
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="hover:bg-green-100"
          >
            <Home className="h-5 w-5 text-green-600" />
          </Button>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="border-t border-orange-100 bg-white/80 backdrop-blur-sm py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>Krushi Pravah &copy; {new Date().getFullYear()} - Jai Jawan, Jai Kisan</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
