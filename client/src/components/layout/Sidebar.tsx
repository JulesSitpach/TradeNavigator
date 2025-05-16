import { useLocation, Link } from "wouter";
import { FaGaugeHigh, FaBoxesStacked, FaTruckFast, FaCalculator, 
  FaMagnifyingGlassDollar, FaGlobe, FaFileLines, FaUser, FaCreditCard,
  FaArrowUpRightFromSquare } from "react-icons/fa6";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
};

const NavItem = ({ to, icon, label, active }: NavItemProps) => {
  return (
    <Link to={to}>
      <a className={cn(
        "flex items-center px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-primary-600 transition-colors",
        active && "text-primary bg-primary-50 border-l-3 border-primary"
      )}>
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
      </a>
    </Link>
  );
};

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useContext(AuthContext);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 overflow-y-auto">
      <div className="flex items-center justify-center h-16 border-b border-neutral-200 py-4">
        <h1 className="text-xl font-bold text-primary">TradeNavigator</h1>
      </div>
      
      <div className="flex flex-col flex-grow p-4 space-y-4">
        <div className="mb-4">
          <div className="flex items-center px-4 py-2 text-primary-600 font-medium">
            <FaGaugeHigh className="mr-3 text-primary" />
            <span>Dashboard</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between px-4 py-2 text-neutral-500 font-medium">
            <span>SHIPPING</span>
          </div>
          <div className="mt-2 space-y-1">
            <NavItem 
              to="/products" 
              icon={<FaBoxesStacked />} 
              label="My Products" 
              active={location === "/products"} 
            />
            <NavItem 
              to="/shipments" 
              icon={<FaTruckFast />} 
              label="Shipments" 
              active={location === "/shipments"} 
            />
            <NavItem 
              to="/product-analysis" 
              icon={<FaCalculator />} 
              label="Cost Analysis" 
              active={location === "/product-analysis"} 
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between px-4 py-2 text-neutral-500 font-medium">
            <span>TRADE TOOLS</span>
          </div>
          <div className="mt-2 space-y-1">
            <NavItem 
              to="/tariff-lookup" 
              icon={<FaMagnifyingGlassDollar />} 
              label="Tariff Lookup" 
              active={location === "/tariff-lookup"} 
            />
            <NavItem 
              to="/market-analysis" 
              icon={<FaGlobe />} 
              label="Market Analysis" 
              active={location === "/market-analysis"} 
            />
            <NavItem 
              to="/reports" 
              icon={<FaFileLines />} 
              label="Reports" 
              active={location === "/reports"} 
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between px-4 py-2 text-neutral-500 font-medium">
            <span>SETTINGS</span>
          </div>
          <div className="mt-2 space-y-1">
            <NavItem 
              to="/profile" 
              icon={<FaUser />} 
              label="Profile" 
              active={location === "/profile"} 
            />
            <NavItem 
              to="/subscription" 
              icon={<FaCreditCard />} 
              label="Subscription" 
              active={location === "/subscription"} 
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-neutral-200">
        <div className="bg-neutral-100 p-4 rounded-lg">
          <p className="text-sm text-neutral-600 mb-3">Your plan: <span className="font-medium text-primary">{user?.subscriptionTier === 'free' ? 'Free' : user?.subscriptionTier === 'starter' ? 'Starter' : user?.subscriptionTier === 'growth' ? 'Growth' : 'Global'}</span></p>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">65% of monthly usage</p>
          <Link to="/subscription">
            <a className="mt-3 text-sm text-primary font-medium flex items-center">
              <FaArrowUpRightFromSquare className="mr-1" />
              Upgrade Plan
            </a>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
