import React from 'react';

interface ToastConfig {
  message: string;
  duration?: number;
  type?: 'info' | 'success' | 'error';
}

interface ToastHandle {
  show: (config: ToastConfig) => void;
}

class ToastService {
  private static instance: ToastService;
  private toastRef: React.RefObject<ToastHandle | null> | null = null;

  private constructor() {}

  static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService();
    }
    return ToastService.instance;
  }

  setToastRef(ref: React.RefObject<ToastHandle | null>) {
    this.toastRef = ref;
  }

  show(config: ToastConfig) {
    if (this.toastRef?.current) {
      this.toastRef.current.show(config);
    }
  }

  showComingSoon(feature: string) {
    this.show({
      message: `${feature} coming soon! 🚀`,
      duration: 2000,
      type: 'info',
    });
  }

  showInfo(message: string) {
    this.show({
      message,
      duration: 2000,
      type: 'info',
    });
  }

  showSuccess(message: string) {
    this.show({
      message,
      duration: 2000,
      type: 'success',
    });
  }

  showError(message: string) {
    this.show({
      message,
      duration: 3000,
      type: 'error',
    });
  }
}

export const toastService = ToastService.getInstance();
