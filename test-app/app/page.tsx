'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window { movementSDK?: any }
}

export default function TestApp() {
  const [sdk, setSDK] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');

  // Initialize SDK
  useEffect(() => {
    const bootstrap = async () => {
      const instance = (typeof window !== 'undefined' ? (window as any).movementSDK : undefined);

      if (instance) {
        setSDK(instance);
        setIsInstalled(instance.isInstalled?.() || false);

        if (instance.isInstalled?.()) {
          try {
            await instance.ready();
            setIsReady(true);

            const userInfo = await instance.getUserInfo();
            setIsConnected(!!userInfo?.address);
            setAddress(userInfo?.address || '');
          } catch (error) {
            console.error('SDK ready error:', error);
          }
        }
      }
    };

    bootstrap();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">test-app</h1>

        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">SDK Status</h2>
            <div className="space-y-2">
              <p>Installed: {isInstalled ? '✅' : '❌'}</p>
              <p>Ready: {isReady ? '✅' : '❌'}</p>
              <p>Connected: {isConnected ? '✅' : '❌'}</p>
              {address && <p>Address: {address}</p>}
            </div>
          </div>


          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Transaction Features</h2>
            <p className="text-gray-300">Transaction handling features are included in this mini app.</p>
       fd   </div>



          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">UI Components</h2>
            <p className="text-gray-300">Native UI components (buttons, alerts) are available.</p>
          </div>







        </div>
      </div>
    </div>
  );
}