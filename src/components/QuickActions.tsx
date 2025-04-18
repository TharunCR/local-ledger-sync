
import React from 'react';
import SendMoney from './SendMoney';
import ReceiveMoney from './ReceiveMoney';
import OfflineTransfer from './OfflineTransfer';

const QuickActions: React.FC = () => {
  return (
    <div className="py-4">
      <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <SendMoney />
        </div>
        <div>
          <ReceiveMoney />
        </div>
        <div>
          <OfflineTransfer />
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
