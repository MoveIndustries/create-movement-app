'use client';

import { useEffect, useMemo, useState } from 'react';

// Scaffold showcasing Movement SDK usage end-to-end for developers.
// Relies on window.movementSDK provided by the host wallet at runtime.

declare global {
  interface Window { movementSDK?: any }
}

type TxStatus = { hash: string; status: string; error?: string } | null;

export default function Scaffold() {
  const [sdk, setSDK] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [network, setNetwork] = useState<string>('');
  const [txStatus, setTxStatus] = useState<TxStatus>(null);
  const [hasFetchedAccount, setHasFetchedAccount] = useState<boolean>(false);
  const [hapticStatus, setHapticStatus] = useState<string>('');
  const [sdkMethods, setSdkMethods] = useState<string[]>([]);
  const [notificationStatus, setNotificationStatus] = useState<string>('');
  const [userInfoStatus, setUserInfoStatus] = useState<string>('');
  const [themeStatus, setThemeStatus] = useState<string>('');
  const [alertStatus, setAlertStatus] = useState<string>('');
  const [confirmStatus, setConfirmStatus] = useState<string>('');
  const [clipboardStatus, setClipboardStatus] = useState<string>('');
  const [balanceStatus, setBalanceStatus] = useState<string>('');
  const [connectStatus, setConnectStatus] = useState<string>('');
  const [signTxStatus, setSignTxStatus] = useState<string>('');
  const [signedTransaction, setSignedTransaction] = useState<any>(null);
  const [submitTxStatus, setSubmitTxStatus] = useState<string>('');
  const [mainButtonStatus, setMainButtonStatus] = useState<string>('');
  const [secondaryButtonStatus, setSecondaryButtonStatus] = useState<string>('');
  const [backButtonStatus, setBackButtonStatus] = useState<string>('');

  // Initialize SDK instance, derive install/ready state, and subscribe to wallet changes
  useEffect(() => {
    const bootstrap = async () => {
      console.log('=== SDK BOOTSTRAP DEBUG ===');
      console.log('window available:', typeof window !== 'undefined');
      console.log('window.movementSDK:', (window as any)?.movementSDK);
      console.log('window.ReactNativeWebView:', (window as any)?.ReactNativeWebView);
      console.log('All window properties:', Object.getOwnPropertyNames(window).filter(name => name.includes('movement') || name.includes('ReactNative')));

      const instance = (typeof window !== 'undefined' ? (window as any).movementSDK : undefined);
      if (!instance) {
        console.log('❌ No movementSDK found on window object - retrying in 1 second...');
        // Retry after 1 second in case SDK is still loading
        setTimeout(() => {
          const retryInstance = (window as any)?.movementSDK;
          if (retryInstance) {
            console.log('✅ Found movementSDK on retry:', retryInstance);
            setSDK(retryInstance);
            // Continue with the rest of the bootstrap...
          } else {
            console.log('❌ Still no movementSDK after retry');
          }
        }, 1000);
        return;
      }
      console.log('✅ Found movementSDK:', instance);
      setSDK(instance);

      // Enumerate available SDK methods for quick inspection in the UI
      const methods = Object.getOwnPropertyNames(instance).filter(name =>
        typeof instance[name] === 'function' || typeof instance[name] === 'object'
      );
      setSdkMethods(methods);
      console.log('Available SDK methods:', methods);

      try {
        const installed = typeof instance.isInstalled === 'function' ? !!instance.isInstalled() : true;
        setIsInstalled(installed);
        if (!installed) return;
        if (typeof instance.ready === 'function') {
          await instance.ready();
          setIsReady(true);
        } else {
          setIsReady(true);
        }
        if (typeof instance.isConnected === 'boolean') setIsConnected(!!instance.isConnected);
        if (instance.address) setAddress(instance.address);
        if (instance.network) setNetwork(instance.network);
      } catch { }

      // Subscribe to wallet changes (public API if present; fallback otherwise)
      const onWalletChange = (walletInfo: any) => {
        const connected = !!walletInfo?.isConnected;
        const addr = walletInfo?.address || '';
        setIsConnected(connected);
        setAddress(addr);
      };
      if (typeof instance.onWalletChange === 'function') {
        try { instance.onWalletChange(onWalletChange); } catch { (instance as any)._onWalletChange = onWalletChange; }
      } else {
        (instance as any)._onWalletChange = onWalletChange;
      }
    };
    bootstrap();
  }, []);

  // Deliberately avoid auto-fetching account/balance so the manual "Get Account" flow is visible.

  // getUserInfo(): one-shot read of connection/address without subscribing
  const fetchUserInfo = async () => {
    setUserInfoStatus('Calling getUserInfo...');

    if (!sdk) {
      setUserInfoStatus('❌ SDK not available');
      return;
    }

    if (!sdk.getUserInfo) {
      setUserInfoStatus('❌ getUserInfo method not available. Available methods: ' + Object.getOwnPropertyNames(sdk).join(', '));
      return;
    }

    try {
      const info = await sdk.getUserInfo();

      if (info) {
        setIsConnected(!!info.isConnected);
        if (info.address) setAddress(info.address);

        // Show just the raw result
        const infoDetails = JSON.stringify(info, null, 2);
        setUserInfoStatus(`✅ getUserInfo result:\n${infoDetails}`);
      } else {
        setUserInfoStatus('⚠️ getUserInfo returned null/undefined');
      }
    } catch (e) {
      setUserInfoStatus(`❌ getUserInfo failed: ${e.message || e}`);
    }
  };

  // Connection is controlled by the host wallet. Mini apps do not initiate/disconnect.
  // Use getAccount/getUserInfo or wallet change events to read connection state.

  // getAccount() and getBalance(): query account details and MOVE balance
  const handleGetAccount = async () => {
    if (!sdk) return;
    try {
      await sdk.ready?.();
      // Prefer getAccount(); fallback to getUserInfo(); fallback to sdk.address
      let addr: string | undefined;
      let balStr: string | undefined;

      if (typeof sdk.getAccount === 'function') {
        const acc = await sdk.getAccount();
        addr = acc?.address;
        balStr = acc?.balance;
      } else if (typeof sdk.getUserInfo === 'function') {
        const info = await sdk.getUserInfo();
        if (info?.address) addr = info.address;
      }

      if (!addr && sdk.address) addr = sdk.address;
      if (!balStr && typeof sdk.getBalance === 'function') {
        balStr = await sdk.getBalance();
      }

      if (addr) setAddress(addr);
      if (balStr) setBalance(balStr);
      if (sdk.network) setNetwork(sdk.network);
      setHasFetchedAccount(true);
    } catch (e) { console.warn(e); }
  };


  // sendTransaction(): sign and submit a transaction via host wallet
  const handleSendTx = async () => {
    if (!sdk || !isConnected) return;
    try {
      await sdk.ready?.();
      if (!address) throw new Error('No address available');
      const result = await sdk.sendTransaction({
        function: '0x1::coin::transfer',
        arguments: ['0x0000000000000000000000000000000000000000000000000000000000000001', '1'],
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
        title: 'Demo Transfer',
        description: 'Send 1 Octa to 0x…01',
      });
      if (result?.hash) {
        // Show hash immediately
        setTxStatus({ hash: result.hash, status: 'pending' });

        // Prefer real-time updates when available
        if (typeof sdk.onTransactionUpdate === 'function') {
          const unsubscribe = sdk.onTransactionUpdate(result.hash, (update: any) => {
            if (update?.status) {
              setTxStatus({ hash: result.hash, status: update.status, error: update?.error });
              if (update.status === 'success' || update.status === 'failed') {
                try { unsubscribe?.(); } catch { }
                sdk.haptic?.({ type: 'notification', style: update.status === 'success' ? 'success' : 'error' });

                // Show back button after transaction completes
                if (update.status === 'success') {
                  showBackButtonAfterTransaction(result.hash);
                }
              }
            }
          });
        } else {
          const status = await sdk.waitForTransaction(result.hash);
          setTxStatus(status);
          await sdk.haptic?.({ type: 'notification', style: status.status === 'success' ? 'success' : 'error' });

          // Show back button after successful transaction
          if (status.status === 'success') {
            showBackButtonAfterTransaction(result.hash);
          }
        }
      } else {
        setTxStatus({ hash: '', status: 'failed', error: 'No hash returned' });
      }
    } catch (e: any) {
      const code = e?.code || '';
      const msg = code === 'USER_REJECTED' ? 'User rejected transaction' : (e?.message || 'Transaction failed');
      setTxStatus({ hash: '', status: 'failed', error: msg });
      await sdk.haptic?.({ type: 'notification', style: 'error' });
    }
  };

  // BackButton: show overlay after successful transaction to return to app
  const showBackButtonAfterTransaction = (txHash: string) => {
    if (!sdk?.BackButton) return;

    // Show back button in host app
    sdk.BackButton.show();
    sdk.BackButton.onClick(() => {
      // Hide the back button
      sdk.BackButton.hide();

      // Navigate back to mini-app (this would be handled by the host app)
      // The host app should detect this and return to the mini-app
      console.log('Back button clicked - returning to mini-app');

      // Optional: Show a notification
      sdk.notify?.({
        title: 'Returned to Mini App',
        body: 'You\'re back in the mini-app!'
      });
    });

    // Auto-hide back button after 30 seconds
    setTimeout(() => {
      sdk.BackButton.hide();
    }, 30000);
  };

  // scanQRCode(): open device camera and return scanned data
  const handleScan = async () => {
    if (!sdk) return;
    try {
      const scanned = await sdk.scanQRCode();
      await sdk.notify?.({ title: 'Scanned', body: scanned });
    } catch (e) { console.warn(e); }
  };

  // haptic(): device vibration feedback (mobile only)
  const handleHaptic = async (type: 'impact' | 'notification' | 'selection', style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'success' | 'warning' | 'error') => {
    setHapticStatus(`Testing ${type}${style ? ` (${style})` : ''} haptic...`);

    if (!sdk) {
      setHapticStatus('❌ SDK not available');
      return;
    }

    // Check for different possible haptic method names
    const hapticMethod = sdk.haptic || sdk.haptics || sdk.vibrate;
    if (!hapticMethod) {
      setHapticStatus(`❌ Haptic method not available on SDK\n\nAvailable methods: ${Object.getOwnPropertyNames(sdk).join(', ')}\n\nLooking for: haptic, haptics, vibrate`);
      return;
    }

    try {
      const options = style ? { type, style } : { type };
      const result = await hapticMethod(options);
      setHapticStatus(`✅ ${type}${style ? ` (${style})` : ''} haptic sent successfully!\n\nResult: ${JSON.stringify(result)}`);
    } catch (error) {
      setHapticStatus(`❌ Haptic execution failed: ${error.message || error}\n\nMethod found but execution failed.`);
    }
  };

  // showPopup(): native popup with custom buttons, returns selected button id
  const handlePopup = async () => {
    if (!sdk) return;
    try {
      const result = await sdk.showPopup({
        title: 'Confirm Action',
        message: 'Proceed with demo?',
        buttons: [
          { id: 'yes', text: 'Yes', type: 'default' },
          { id: 'no', text: 'No', type: 'cancel' },
        ],
      });
      await sdk.notify?.({ title: 'Popup', body: `Selected: ${result?.button_id || 'none'}` });
    } catch (e) { console.warn(e); }
  };

  // storage.get/set/remove(): local device storage scoped to the mini app
  const handleStorage = async () => {
    if (!sdk?.storage) return;
    try {
      await sdk.storage.set('demo_key', 'demo_value');
      const val = await sdk.storage.get('demo_key');
      await sdk.notify?.({ title: 'Storage', body: `demo_key=${val}` });
      await sdk.storage.remove('demo_key');
    } catch (e) { console.warn(e); }
  };

  // connect(): example status check using getUserInfo (host controls actual connection)
  const handleConnect = async () => {
    setConnectStatus('Checking connection...');
    if (!sdk) {
      setConnectStatus('❌ SDK not available');
      return;
    }
    try {
      // Connection is controlled by host app, but we can check status
      const info = await sdk.getUserInfo?.();
      setConnectStatus(`✅ Connection status: ${info?.isConnected ? 'Connected' : 'Disconnected'}\nAddress: ${info?.address || 'None'}`);
    } catch (e) {
      setConnectStatus(`❌ Connection check failed: ${e.message || e}`);
    }
  };

  // getBalance(): fetch current MOVE balance as string
  const handleGetBalance = async () => {
    setBalanceStatus('Getting balance...');
    if (!sdk) {
      setBalanceStatus('❌ SDK not available');
      return;
    }
    try {
      const balance = await sdk.getBalance?.();
      setBalanceStatus(`✅ Balance: ${balance || 'Unable to fetch'}`);
    } catch (e) {
      setBalanceStatus(`❌ Balance fetch failed: ${e.message || e}`);
    }
  };

  // getTheme(): read current host theme/preferences
  const handleGetTheme = async () => {
    setThemeStatus('Getting theme...');
    if (!sdk) {
      setThemeStatus('❌ SDK not available');
      return;
    }
    try {
      const theme = await sdk.getTheme?.();
      setThemeStatus(`✅ Theme: ${JSON.stringify(theme, null, 2)}`);
    } catch (e) {
      setThemeStatus(`❌ Theme fetch failed: ${e.message || e}`);
    }
  };

  // showAlert(): native alert dialog
  const handleShowAlert = async () => {
    setAlertStatus('Showing alert...');
    if (!sdk) {
      setAlertStatus('❌ SDK not available');
      return;
    }
    try {
      await sdk.showAlert?.('This is a test alert from the SDK');
      setAlertStatus(`✅ Alert shown successfully`);
    } catch (e) {
      setAlertStatus(`❌ Alert failed: ${e.message || e}`);
    }
  };

  // showConfirm(): native confirm dialog returning boolean
  const handleShowConfirm = async () => {
    setConfirmStatus('Showing confirm dialog...');
    if (!sdk) {
      setConfirmStatus('❌ SDK not available');
      return;
    }
    try {
      const result = await sdk.showConfirm?.(
        'Do you want to proceed with this action?',
        'Yes, Proceed',
        'Cancel'
      );
      setConfirmStatus(`✅ Confirm dialog shown. Result: ${result ? 'User confirmed' : 'User cancelled'}`);
    } catch (e) {
      setConfirmStatus(`❌ Confirm dialog failed: ${e.message || e}`);
    }
  };

  // Clipboard.read/write(): interact with system clipboard
  const handleClipboard = async () => {
    setClipboardStatus('Testing clipboard...');
    if (!sdk) {
      setClipboardStatus('❌ SDK not available');
      return;
    }
    try {
      // Test writing to clipboard
      await sdk.Clipboard?.write?.('Hello from Movement SDK!');
      const text = await sdk.Clipboard?.read?.();
      setClipboardStatus(`✅ Clipboard test successful!\nWritten: "Hello from Movement SDK!"\nRead: "${text}"`);
    } catch (e) {
      setClipboardStatus(`❌ Clipboard test failed: ${e.message || e}`);
    }
  };

  // Two-step demo – Step 1: prepare a transaction payload
  const handleSignTransaction = async () => {
    setSignTxStatus('Preparing transaction...');
    setSignedTransaction(null);
    setSubmitTxStatus('');

    if (!sdk) {
      setSignTxStatus('❌ SDK not available');
      return;
    }

    try {
      // Create transaction payload (this simulates "signing" step)
      const transactionPayload = {
        function: '0x1::coin::transfer',
        arguments: ['0x0000000000000000000000000000000000000000000000000000000000000001', '1'],
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
        title: 'Demo Transfer (Pre-signed)',
        description: 'Send 1 Octa to 0x…01',
      };

      setSignedTransaction(transactionPayload);
      setSignTxStatus(`✅ Transaction prepared successfully!\n\nTransaction payload created and ready to submit.\n\nPayload: ${JSON.stringify(transactionPayload, null, 2)}`);
    } catch (e) {
      setSignTxStatus(`❌ Prepare transaction failed: ${e.message || e}`);
    }
  };

  // Two-step demo – Step 2: submit prepared payload via sendTransaction()
  const handleSubmitTransaction = async () => {
    if (!signedTransaction) {
      setSubmitTxStatus('❌ No transaction prepared. Please prepare a transaction first.');
      return;
    }

    setSubmitTxStatus('Submitting prepared transaction...');

    if (!sdk) {
      setSubmitTxStatus('❌ SDK not available');
      return;
    }

    try {
      // Actually submit the transaction using sendTransaction
      const result = await sdk.sendTransaction(signedTransaction);

      if (result?.hash) {
        setSubmitTxStatus(`✅ Transaction submitted successfully!\n\nHash: ${result.hash}\nSuccess: ${result.success}`);

        // Show hash in main transaction status
        setTxStatus({ hash: result.hash, status: 'pending' });

        // Clear the prepared transaction
        setSignedTransaction(null);
      } else {
        setSubmitTxStatus(`❌ Transaction submission failed - no hash returned`);
      }
    } catch (e) {
      setSubmitTxStatus(`❌ Submit transaction failed: ${e.message || e}`);
    }
  };

  // MainButton: primary fixed overlay button controls
  const handleMainButtonShow = async () => {
    setMainButtonStatus('Checking MainButton availability...');

    if (!sdk) {
      setMainButtonStatus('❌ SDK not available');
      return;
    }

    if (!sdk.MainButton) {
      setMainButtonStatus('❌ sdk.MainButton not available. Available SDK properties: ' + Object.getOwnPropertyNames(sdk).join(', '));
      return;
    }

    if (typeof sdk.MainButton.show !== 'function') {
      setMainButtonStatus('❌ sdk.MainButton.show is not a function. MainButton methods: ' + Object.getOwnPropertyNames(sdk.MainButton).join(', '));
      return;
    }

    try {
      sdk.MainButton.setText('Demo Main Button');
      sdk.MainButton.show();
      sdk.MainButton.onClick(() => {
        setMainButtonStatus('✅ MainButton clicked! (This means it\'s working)');
        sdk.MainButton.hide();
      });
      setMainButtonStatus('✅ MainButton.show() called successfully! You should see a button overlay at the bottom of this mini-app.');
    } catch (e) {
      setMainButtonStatus(`❌ MainButton.show() failed: ${e.message || e}`);
    }
  };

  // MainButton: hide overlay
  const handleMainButtonHide = async () => {
    if (!sdk?.MainButton) {
      setMainButtonStatus('❌ sdk.MainButton not available');
      return;
    }

    try {
      sdk.MainButton.hide();
      setMainButtonStatus('✅ MainButton.hide() called successfully!');
    } catch (e) {
      setMainButtonStatus(`❌ MainButton.hide() failed: ${e.message || e}`);
    }
  };

  // SecondaryButton: secondary fixed overlay button controls
  const handleSecondaryButtonShow = async () => {
    setSecondaryButtonStatus('Checking SecondaryButton availability...');

    if (!sdk) {
      setSecondaryButtonStatus('❌ SDK not available');
      return;
    }

    if (!sdk.SecondaryButton) {
      setSecondaryButtonStatus('❌ sdk.SecondaryButton not available. Available SDK properties: ' + Object.getOwnPropertyNames(sdk).join(', '));
      return;
    }

    try {
      sdk.SecondaryButton.setText('Demo Secondary');
      sdk.SecondaryButton.show();
      sdk.SecondaryButton.onClick(() => {
        setSecondaryButtonStatus('✅ SecondaryButton clicked! (This means it\'s working)');
        sdk.SecondaryButton.hide();
      });
      setSecondaryButtonStatus('✅ SecondaryButton.show() called successfully! You should see a button overlay at the bottom of this mini-app.');
    } catch (e) {
      setSecondaryButtonStatus(`❌ SecondaryButton.show() failed: ${e.message || e}`);
    }
  };

  // SecondaryButton: hide overlay
  const handleSecondaryButtonHide = async () => {
    if (!sdk?.SecondaryButton) {
      setSecondaryButtonStatus('❌ sdk.SecondaryButton not available');
      return;
    }

    try {
      sdk.SecondaryButton.hide();
      setSecondaryButtonStatus('✅ SecondaryButton.hide() called successfully!');
    } catch (e) {
      setSecondaryButtonStatus(`❌ SecondaryButton.hide() failed: ${e.message || e}`);
    }
  };

  // BackButton: top overlay back control
  const handleBackButtonShow = async () => {
    setBackButtonStatus('Checking BackButton availability...');

    if (!sdk) {
      setBackButtonStatus('❌ SDK not available');
      return;
    }

    if (!sdk.BackButton) {
      setBackButtonStatus('❌ sdk.BackButton not available. Available SDK properties: ' + Object.getOwnPropertyNames(sdk).join(', '));
      return;
    }

    try {
      sdk.BackButton.show();
      sdk.BackButton.onClick(() => {
        setBackButtonStatus('✅ BackButton clicked! (This means it\'s working)');
        sdk.BackButton.hide();
      });
      setBackButtonStatus('✅ BackButton.show() called successfully! You should see a back button overlay at the top of this mini-app.');
    } catch (e) {
      setBackButtonStatus(`❌ BackButton.show() failed: ${e.message || e}`);
    }
  };

  // BackButton: hide overlay
  const handleBackButtonHide = async () => {
    if (!sdk?.BackButton) {
      setBackButtonStatus('❌ sdk.BackButton not available');
      return;
    }

    try {
      sdk.BackButton.hide();
      setBackButtonStatus('✅ BackButton.hide() called successfully!');
    } catch (e) {
      setBackButtonStatus(`❌ BackButton.hide() failed: ${e.message || e}`);
    }
  };

  // sendNotification(): request host to deliver a push notification
  const handleNotification = async () => {
    console.log('=== NOTIFICATION BUTTON CLICKED ===');
    setNotificationStatus('Button clicked!');

    if (!sdk) {
      setNotificationStatus('SDK not available');
      return;
    }

    setNotificationStatus('Sending notification...');
    try {
      console.log('=== NOTIFICATION DEBUG ===');
      console.log('SDK object:', sdk);
      console.log('All SDK methods:', Object.getOwnPropertyNames(sdk));
      console.log('SDK.sendNotification type:', typeof sdk.sendNotification);
      console.log('SDK.sendNotification value:', sdk.sendNotification);
      console.log('SDK.notify type:', typeof sdk.notify);
      console.log('SDK.notify value:', sdk.notify);

      // Check if sendNotification method is available (it's in the available methods list!)
      if (!sdk.sendNotification) {
        setNotificationStatus('❌ sendNotification method not available. Available methods: ' + Object.getOwnPropertyNames(sdk).join(', '));
        return;
      }

      console.log('Using sendNotification method (found in available methods)');

      // Try different notification approaches for dev build
      console.log('Trying basic notification...');
      const result1 = await sdk.sendNotification({
        title: 'Test Notification',
        body: 'If you see this, notifications are working!',
      });

      console.log('Basic notification result:', result1);

      // Try with different options
      console.log('Trying notification with badge...');
      const result2 = await sdk.sendNotification({
        title: 'Test with Badge',
        body: 'This should show a badge if notifications work',
        badge: 1,
      });

      console.log('Badge notification result:', result2);

      // Try minimal notification
      console.log('Trying minimal notification...');
      const result3 = await sdk.sendNotification({
        title: 'Minimal Test',
        body: 'Minimal notification test',
      });

      console.log('Minimal notification result:', result3);

      // Try browser notifications as fallback for dev builds
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Browser Notification Test', {
            body: 'This is a browser notification fallback',
            icon: '/favicon.ico'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Browser Notification Test', {
                body: 'This is a browser notification fallback',
                icon: '/favicon.ico'
              });
            }
          });
        }
      }

      setNotificationStatus('✅ Notifications sent! For dev builds, check Movement Everything app settings for notification options. Also check browser console for detailed results.');
    } catch (error) {
      console.error('Notification failed:', error);
      setNotificationStatus(`❌ Failed: ${error.message || error}`);
    }
  };

  const Stat = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-mono text-gray-200 break-all">{value || '—'}</div>
    </div>
  );

  const Card = ({ title, children, subtitle }: { title: string; subtitle?: string; children: React.ReactNode }) => (
    <div className="bg-[#1A1F2E] rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
      <div className="bg-gradient-to-r from-[#06B6D4]/20 to-[#6366F1]/20 px-5 py-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );

  const disabled = useMemo(() => {
    const isDisabled = !sdk || !isInstalled || !isReady;
    console.log('Button disabled state:', {
      sdk: !!sdk,
      isInstalled,
      isReady,
      disabled: isDisabled
    });
    return isDisabled;
  }, [sdk, isInstalled, isReady]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md w-full mx-auto py-4 space-y-4">
        <div className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#06B6D4] rounded-2xl p-6 shadow-xl">
          <div className="text-white/80 text-sm mb-1">Movement SDK</div>
          <div className="text-3xl font-bold text-white mb-2">Mini App Scaffold</div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Stat label="Installed" value={String(isInstalled)} />
            <Stat label="Ready" value={String(isReady)} />
            <Stat label="Connected" value={String(isConnected)} />
            <Stat label="Network" value={network} />
          </div>
        </div>

        {/* Core SDK Methods */}
        <Card title="1. Core SDK Methods" subtitle="isInstalled, ready, connect">
          <div className="grid grid-cols-2 gap-3">
            <button disabled={disabled} onClick={handleConnect} className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}>Connect</button>
            <div className="px-4 py-3 bg-[#0A0F1E] border border-gray-700 rounded-xl text-center">
              <div className="text-xs text-gray-400">isInstalled</div>
              <div className="text-sm font-mono text-gray-200">{isInstalled ? '✅' : '❌'}</div>
            </div>
            <div className="px-4 py-3 bg-[#0A0F1E] border border-gray-700 rounded-xl text-center">
              <div className="text-xs text-gray-400">ready</div>
              <div className="text-sm font-mono text-gray-200">{isReady ? '✅' : '❌'}</div>
            </div>
          </div>
          {connectStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">Connect Status:</div>
              <div className="text-gray-200 whitespace-pre-wrap">{connectStatus}</div>
            </div>
          )}
        </Card>

        {/* Account & Balance */}
        <Card title="2. Account & Balance" subtitle="getUserInfo, getAccount, getBalance">
          <div className="grid grid-cols-2 gap-3">
            <button disabled={disabled} onClick={fetchUserInfo} className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}>getUserInfo</button>
            <button disabled={disabled} onClick={handleGetAccount} className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}>getAccount</button>
            <button disabled={disabled} onClick={handleGetBalance} className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}>getBalance</button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Stat label="Address" value={hasFetchedAccount ? address : 'tap getAccount to populate'} />
            <Stat label="Balance (MOVE)" value={hasFetchedAccount ? balance : 'tap getAccount to populate'} />
          </div>
          {userInfoStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">getUserInfo Status:</div>
              <div className="text-gray-200 whitespace-pre-wrap max-h-32 overflow-y-auto text-xs font-mono">{userInfoStatus}</div>
            </div>
          )}
          {balanceStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">Balance Status:</div>
              <div className="text-gray-200">{balanceStatus}</div>
            </div>
          )}
        </Card>

        {/* Transactions */}
        <Card title="3. Transactions" subtitle="sendTransaction, signTransaction, waitForTransaction">
          <div className="space-y-4">
            {/* One-step process */}
            <div>
              <div className="text-sm font-semibold text-gray-300 mb-2">One-Step Process (sendTransaction)</div>
              <button disabled={disabled || !isConnected} onClick={handleSendTx} className={`w-full px-4 py-3 rounded-xl font-semibold ${(!disabled && isConnected) ? 'bg-[#06B6D4] text-black hover:bg-[#0891B2]' : 'bg-gray-700 text-gray-400'}`}>
                sendTransaction (Sign + Submit)
              </button>
              <div className="text-xs text-gray-400 mt-1">Signs and submits transaction in one step</div>
            </div>

            {/* Two-step process */}
            <div>
              <div className="text-sm font-semibold text-gray-300 mb-2">Two-Step Process (prepare + submit)</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={disabled || !isConnected}
                  onClick={handleSignTransaction}
                  className={`px-4 py-3 rounded-xl font-semibold ${(!disabled && isConnected) ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]' : 'bg-gray-700 text-gray-400'}`}
                >
                  Step 1: Prepare
                </button>
                <button
                  disabled={disabled || !signedTransaction}
                  onClick={handleSubmitTransaction}
                  className={`px-4 py-3 rounded-xl font-semibold ${(!disabled && signedTransaction) ? 'bg-[#059669] text-white hover:bg-[#047857]' : 'bg-gray-700 text-gray-400'}`}
                >
                  Step 2: Submit
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Step 1: Prepare transaction payload → Step 2: Submit transaction
                {signedTransaction && <span className="text-green-400 ml-2">✓ Transaction prepared and ready to submit</span>}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-3">waitForTransaction is used automatically after sendTransaction</div>
          {txStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="font-mono break-all">
                hash: {txStatus.hash ? (
                  <a
                    href={`https://explorer.movementnetwork.xyz/txn/${txStatus.hash}?network=mainnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#06B6D4] hover:text-[#0891B2] underline"
                  >
                    {txStatus.hash}
                  </a>
                ) : '—'}
              </div>
              <div>status: {txStatus.status}</div>
              {txStatus.error && <div className="text-red-400">error: {txStatus.error}</div>}
            </div>
          )}
          {signTxStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">Step 1 - Sign Transaction Status:</div>
              <div className="text-gray-200 whitespace-pre-wrap max-h-32 overflow-y-auto text-xs font-mono">{signTxStatus}</div>
            </div>
          )}
          {submitTxStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">Step 2 - Submit Transaction Status:</div>
              <div className="text-gray-200 whitespace-pre-wrap max-h-32 overflow-y-auto text-xs font-mono">{submitTxStatus}</div>
            </div>
          )}
        </Card>

        {/* Device & UI */}
        <Card title="4. Device & UI" subtitle="scanQRCode, showPopup, showAlert, showConfirm, sendNotification">
          <div className="grid grid-cols-2 gap-3">
            <button disabled={disabled} onClick={handleScan} className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}>scanQRCode</button>
            <button disabled={disabled} onClick={handlePopup} className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}>showPopup</button>
            <button disabled={disabled} onClick={handleShowAlert} className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}>showAlert</button>
            <button disabled={disabled} onClick={handleShowConfirm} className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}>showConfirm</button>
            <button disabled={disabled} onClick={handleNotification} className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}>sendNotification</button>
          </div>
          {notificationStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">Notification Status:</div>
              <div className="text-gray-200">{notificationStatus}</div>
            </div>
          )}
          {alertStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">Alert Status:</div>
              <div className="text-gray-200">{alertStatus}</div>
            </div>
          )}
          {confirmStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">Confirm Status:</div>
              <div className="text-gray-200">{confirmStatus}</div>
            </div>
          )}
        </Card>

        {/* Storage & Clipboard */}
        <Card title="5. Storage & Clipboard" subtitle="CloudStorage, Clipboard">
          <div className="grid grid-cols-2 gap-3">
            <button disabled={disabled} onClick={handleStorage} className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}>CloudStorage</button>
            <button disabled={disabled} onClick={handleClipboard} className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}>Clipboard</button>
          </div>
          {clipboardStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">Clipboard Status:</div>
              <div className="text-gray-200 whitespace-pre-wrap">{clipboardStatus}</div>
            </div>
          )}
        </Card>

        {/* Theme & Haptics */}
        <Card title="6. Theme & Haptics" subtitle="getTheme, haptic feedback">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button disabled={disabled} onClick={handleGetTheme} className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}>getTheme</button>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm text-gray-400 font-medium">Impact Feedback:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button disabled={disabled} onClick={() => handleHaptic('impact', 'light')} className={`px-3 py-2 rounded-lg text-sm font-medium ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}>Light</button>
                  <button disabled={disabled} onClick={() => handleHaptic('impact', 'medium')} className={`px-3 py-2 rounded-lg text-sm font-medium ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>Medium</button>
                  <button disabled={disabled} onClick={() => handleHaptic('impact', 'heavy')} className={`px-3 py-2 rounded-lg text-sm font-medium ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>Heavy</button>
                  <button disabled={disabled} onClick={() => handleHaptic('impact', 'rigid')} className={`px-3 py-2 rounded-lg text-sm font-medium ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-orange-600 text-white hover:bg-orange-700'}`}>Rigid</button>
                  <button disabled={disabled} onClick={() => handleHaptic('impact', 'soft')} className={`px-3 py-2 rounded-lg text-sm font-medium ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-pink-600 text-white hover:bg-pink-700'}`}>Soft</button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-400 font-medium">Notification Feedback:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button disabled={disabled} onClick={() => handleHaptic('notification', 'success')} className={`px-3 py-2 rounded-lg text-sm font-medium ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>Success</button>
                  <button disabled={disabled} onClick={() => handleHaptic('notification', 'warning')} className={`px-3 py-2 rounded-lg text-sm font-medium ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-yellow-600 text-white hover:bg-yellow-700'}`}>Warning</button>
                  <button disabled={disabled} onClick={() => handleHaptic('notification', 'error')} className={`px-3 py-2 rounded-lg text-sm font-medium ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-red-600 text-white hover:bg-red-700'}`}>Error</button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-400 font-medium">Selection Feedback:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button disabled={disabled} onClick={() => handleHaptic('selection')} className={`px-3 py-2 rounded-lg text-sm font-medium ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>Selection</button>
                </div>
              </div>
            </div>
          </div>
          {themeStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">Theme Status:</div>
              <div className="text-gray-200 whitespace-pre-wrap max-h-32 overflow-y-auto text-xs font-mono">{themeStatus}</div>
            </div>
          )}
          {hapticStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">Haptic Status:</div>
              <div className="text-gray-200 whitespace-pre-wrap max-h-32 overflow-y-auto text-xs font-mono">{hapticStatus}</div>
            </div>
          )}
        </Card>

        {/* Native UI Buttons */}
        <Card title="7. Native UI Buttons" subtitle="MainButton, SecondaryButton, BackButton">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={disabled}
                onClick={handleMainButtonShow}
                className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}
              >
                Show MainButton
              </button>
              <button
                disabled={disabled}
                onClick={handleMainButtonHide}
                className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
              >
                Hide MainButton
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={disabled}
                onClick={handleSecondaryButtonShow}
                className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}
              >
                Show SecondaryButton
              </button>
              <button
                disabled={disabled}
                onClick={handleSecondaryButtonHide}
                className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
              >
                Hide SecondaryButton
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={disabled}
                onClick={handleBackButtonShow}
                className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-[#06B6D4] text-black hover:bg-[#0891B2]'}`}
              >
                Show BackButton
              </button>
              <button
                disabled={disabled}
                onClick={handleBackButtonHide}
                className={`px-4 py-3 rounded-xl font-semibold ${disabled ? 'bg-gray-700 text-gray-400' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
              >
                Hide BackButton
              </button>
            </div>
          </div>

          {/* Status displays */}
          {mainButtonStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">MainButton Status:</div>
              <div className="text-gray-200 whitespace-pre-wrap">{mainButtonStatus}</div>
            </div>
          )}

          {secondaryButtonStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">SecondaryButton Status:</div>
              <div className="text-gray-200 whitespace-pre-wrap">{secondaryButtonStatus}</div>
            </div>
          )}

          {backButtonStatus && (
            <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-sm">
              <div className="text-gray-400 text-xs mb-1">BackButton Status:</div>
              <div className="text-gray-200 whitespace-pre-wrap">{backButtonStatus}</div>
            </div>
          )}

          <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-xs">
            <div className="text-gray-400 mb-2">How it works:</div>
            <div className="text-gray-200 space-y-1">
              <div>• Click "Show" to display overlay buttons on top of this mini-app</div>
              <div>• Click "Hide" to remove the overlay buttons</div>
              <div>• MainButton/SecondaryButton appear at the bottom as overlays</div>
              <div>• BackButton appears at the top as an overlay</div>
              <div>• These are native UI overlays, not regular HTML buttons</div>
            </div>
          </div>
        </Card>


        <Card title="Debug" subtitle="Available SDK methods">
          <div className="text-xs text-gray-400 mb-2">
            Found {sdkMethods.length} methods/properties on SDK:
          </div>
          <div className="bg-[#0A0F1E] border border-gray-700 rounded-xl p-3 text-xs font-mono text-gray-300 max-h-32 overflow-y-auto">
            {sdkMethods.length > 0 ? sdkMethods.join(', ') : 'No methods found'}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Check browser console for detailed method inspection.
          </div>
        </Card>
      </div>
    </div>
  );
}


