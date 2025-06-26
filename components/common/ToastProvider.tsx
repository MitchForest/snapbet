import React, { useRef, useEffect } from 'react';
import { Toast } from './Toast';
import { toastService } from '@/services/toastService';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastHandle {
  show: (config: {
    message: string;
    duration?: number;
    type?: 'info' | 'success' | 'error';
  }) => void;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const toastRef = useRef<ToastHandle>(null);
  const { isOffline } = useNetworkStatus();

  useEffect(() => {
    toastService.setToastRef(toastRef);
  }, []);

  useEffect(() => {
    if (isOffline) {
      toastRef.current?.show({
        message: 'You are currently offline',
        type: 'error',
        duration: 5000,
      });
    }
  }, [isOffline]);

  return (
    <>
      {children}
      <Toast ref={toastRef} />
    </>
  );
}
