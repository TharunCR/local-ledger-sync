
import React from 'react';
import { useUpi } from '@/context/UpiContext';
import { Switch } from '@/components/ui/switch';
import { WifiIcon, WifiOffIcon, BluetoothIcon, BluetoothOffIcon } from 'lucide-react';

const Header: React.FC = () => {
  const { isOnline, toggleOnline, isBluetoothOn, toggleBluetooth } = useUpi();
  
  return (
    <header className="bg-white sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-upi-blue">Payzzle</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-upi-darkGray">
              {isBluetoothOn ? (
                <div className="flex items-center text-blue-500">
                  <BluetoothIcon size={16} className="mr-1" /> BT On
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <BluetoothOffIcon size={16} className="mr-1" /> BT Off
                </div>
              )}
            </span>
            <Switch 
              checked={isBluetoothOn} 
              onCheckedChange={toggleBluetooth} 
              className={isBluetoothOn ? "bg-blue-500" : "bg-gray-300"} 
            />
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
      </div>
    </header>
  );
};

export default Header;
