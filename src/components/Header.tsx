
import React from 'react';
import { useUpi } from '@/context/UpiContext';
import { Switch } from '@/components/ui/switch';
import { WifiIcon, WifiOffIcon } from 'lucide-react';

const Header: React.FC = () => {
  const { isOnline, toggleOnline } = useUpi();
  
  return (
    <header className="bg-white sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-upi-blue">Payzzle</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-upi-darkGray">
            {isOnline ? (
              <div className="flex items-center text-upi-green">
                <WifiIcon size={16} className="mr-1" /> Online
              </div>
            ) : (
              <div className="flex items-center text-upi-red">
                <WifiOffIcon size={16} className="mr-1" /> Offline
              </div>
            )}
          </span>
          <Switch 
            checked={isOnline} 
            onCheckedChange={toggleOnline} 
            className={isOnline ? "bg-upi-green" : "bg-upi-red"} 
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
