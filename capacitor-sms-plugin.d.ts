declare module 'capacitor-sms-plugin' {
    export interface PermissionStatus {
      send_sms: 'granted' | 'denied' | 'prompt';
      read_phone_state: 'granted' | 'denied' | 'prompt';
    }
  
    export interface SmsSenderOptions {
      id: number;
      sim: number;
      phone: string;
      text: string;
    }
  
    export interface SmsSenderResult {
      id: number;
      status: 'FAILED' | 'SENT' | 'DELIVERED';
    }
  
    export interface SmsSenderPlugin {
      send(opts: SmsSenderOptions): Promise<SmsSenderResult>;
      checkPermissions(): Promise<PermissionStatus>;
      requestPermissions(): Promise<PermissionStatus>;
      addListener(
        eventName: 'smsSenderDelivered',
        listenerFunc: (result: SmsSenderResult) => void
      ): Promise<import('@capacitor/core').PluginListenerHandle> & import('@capacitor/core').PluginListenerHandle;
      removeAllListeners(): Promise<void>;
    }
  
    const SmsSender: SmsSenderPlugin;
    export { SmsSender };
  }
  