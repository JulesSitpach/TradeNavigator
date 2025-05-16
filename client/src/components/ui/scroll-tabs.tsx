import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollTabsProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollTabs: React.FC<ScrollTabsProps> = ({ children, className = '' }) => {
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // Function to check if tabs are overflowing and update scroll button visibility
  const checkTabOverflow = () => {
    const tabsContainer = tabsContainerRef.current;
    if (!tabsContainer) return;
    
    const hasOverflow = tabsContainer.scrollWidth > tabsContainer.clientWidth;
    const atLeftEdge = tabsContainer.scrollLeft === 0;
    const atRightEdge = Math.abs(
      tabsContainer.scrollWidth - tabsContainer.clientWidth - tabsContainer.scrollLeft
    ) < 1;
    
    setShowLeftScroll(hasOverflow && !atLeftEdge);
    setShowRightScroll(hasOverflow && !atRightEdge);
  };

  // Scroll handlers
  const scrollLeft = () => {
    if (!tabsContainerRef.current) return;
    tabsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!tabsContainerRef.current) return;
    tabsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  // Check for overflow on mount and window resize
  useEffect(() => {
    checkTabOverflow();
    
    const handleResize = () => {
      checkTabOverflow();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Listen for scroll events to update button visibility
  useEffect(() => {
    const tabsContainer = tabsContainerRef.current;
    if (!tabsContainer) return;
    
    const handleScroll = () => {
      checkTabOverflow();
    };
    
    tabsContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      tabsContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative">
      {showLeftScroll && (
        <Button 
          className="scroll-tab-button left"
          variant="ghost" 
          size="sm"
          onClick={scrollLeft}
        >
          <ChevronLeft size={16} />
        </Button>
      )}
      
      <div 
        ref={tabsContainerRef}
        className={`scrollable-tabs-container ${className}`}
      >
        {children}
      </div>
      
      {showRightScroll && (
        <Button 
          className="scroll-tab-button right"
          variant="ghost" 
          size="sm"
          onClick={scrollRight}
        >
          <ChevronRight size={16} />
        </Button>
      )}
    </div>
  );
};

export default ScrollTabs;