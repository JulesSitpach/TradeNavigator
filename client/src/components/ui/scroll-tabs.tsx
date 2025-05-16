import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import "../../styles/cost-breakdown-form.css";

interface ScrollTabsProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollableTabs: React.FC<ScrollTabsProps> = ({ 
  children,
  className,
  ...props
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  // Check if scrolling is needed
  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding errors
    }
  };
  
  // Scroll left
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };
  
  // Scroll right
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    // Check initially
    checkScrollability();
    
    // Check on resize
    const handleResize = () => {
      checkScrollability();
    };
    
    // Handle scroll events
    const handleScroll = () => {
      checkScrollability();
    };
    
    window.addEventListener('resize', handleResize);
    
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className="relative flex items-center">
      {showLeftArrow && (
        <button 
          onClick={scrollLeft}
          className="scroll-tab-button left-0"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      
      <div 
        ref={scrollContainerRef}
        className={cn("scrollable-tabs-container", className)}
        {...props}
      >
        {children}
      </div>
      
      {showRightArrow && (
        <button 
          onClick={scrollRight}
          className="scroll-tab-button right-0"
          aria-label="Scroll tabs right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};