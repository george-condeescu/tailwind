import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

//layout
import Header from './components/layout/header';
import LeftMenu from './components/layout/leftMenu';
import Footer from './components/layout/footer';

//routes
import AppRoutes from './routes/AppRoutes';

export default function ResponsiveLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Router>
        {/* Header */}
        <Header
          toggleMobileMenu={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <div className="flex flex-1">
          {/* Left Menu */}
          <LeftMenu
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          {/* Main Content */}
          <AppRoutes />
        </div>
      </Router>
      <Footer />
    </div>
  );
}
