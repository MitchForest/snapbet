import React, { useRef, useEffect } from 'react';
import { Toast } from './Toast';
import { toastService } from '@/services/toastService';

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

  useEffect(() => {
    toastService.setToastRef(toastRef);
  }, []);

  return (
    <>
      {children}
      <Toast ref={toastRef} />
    </>
  );
}
