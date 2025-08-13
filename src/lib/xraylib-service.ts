import { XraylibService } from '@/types';
import { ApiXraylibService } from './xraylib-api';

declare global {
  interface Window {
    _xraylib?: any;
  }
}

class XraylibServiceImpl implements XraylibService {
  private xraylib: any = null;
  private apiService: ApiXraylibService | null = null;
  public isLoaded = false;

  async load(): Promise<void> {
    if (this.isLoaded && this.xraylib) {
      return;
    }

    if (window._xraylib) {
      this.xraylib = window._xraylib;
      this.isLoaded = true;
      return;
    }

    try {
      // Use API implementation
      console.log('Connecting to xraylib API server...');
      this.apiService = new ApiXraylibService();
      await this.apiService.load();
      
      // Create wrapper to use API service (convert to sync interface for compatibility)
      this.xraylib = {
        EdgeEnergy: (Z: number, shell: number) => {
          // Note: This will need to be handled asynchronously in the calculation engine
          return this.apiService!.EdgeEnergy(Z, shell);
        },
        CS_Total: (Z: number, energy: number) => {
          return this.apiService!.CS_Total(Z, energy);
        },
        AtomicWeight: (Z: number) => {
          return this.apiService!.AtomicWeight(Z);
        }
      };
      
      window._xraylib = this.xraylib;
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to connect to xraylib API:', error);
      throw new Error(`Failed to connect to xraylib API server. Make sure the Python server is running on http://localhost:5001. Run: python xraylib_server.py`);
    }
  }


  EdgeEnergy(Z: number, shell: number): Promise<number> {
    if (!this.isLoaded || !this.xraylib) {
      throw new Error('xraylib not loaded. Call load() first.');
    }
    return this.xraylib.EdgeEnergy(Z, shell);
  }

  CS_Total(Z: number, energy: number): Promise<number> {
    if (!this.isLoaded || !this.xraylib) {
      throw new Error('xraylib not loaded. Call load() first.');
    }
    return this.xraylib.CS_Total(Z, energy);
  }

  AtomicWeight(Z: number): Promise<number> {
    if (!this.isLoaded || !this.xraylib) {
      throw new Error('xraylib not loaded. Call load() first.');
    }
    return this.xraylib.AtomicWeight(Z);
  }
}

export const xraylibService = new XraylibServiceImpl();