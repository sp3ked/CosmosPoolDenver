interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: any) => void;
    removeListener: (event: string, callback: any) => void;
    removeAllListeners: (event: string) => void;
  };
}
