// API-based xraylib implementation
export class ApiXraylibService {
  private baseUrl: string;
  public isLoaded = false;

  constructor(baseUrl: string = 'http://localhost:5001') {
    this.baseUrl = baseUrl;
  }

  async load(): Promise<void> {
    try {
      // Check if the API is available
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error('xraylib API server is not running');
      }
      const data = await response.json();
      console.log('Connected to xraylib API server, version:', data.xraylib_version);
      this.isLoaded = true;
    } catch (error) {
      throw new Error(`Failed to connect to xraylib API server at ${this.baseUrl}. Make sure the server is running.`);
    }
  }

  async EdgeEnergy(Z: number, shell: number): Promise<number> {
    if (!this.isLoaded) {
      throw new Error('xraylib not loaded. Call load() first.');
    }
    
    const response = await fetch(`${this.baseUrl}/edge_energy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Z, shell })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get edge energy');
    }
    
    const data = await response.json();
    return data.energy;
  }

  async CS_Total(Z: number, energy: number): Promise<number> {
    if (!this.isLoaded) {
      throw new Error('xraylib not loaded. Call load() first.');
    }
    
    const response = await fetch(`${this.baseUrl}/cs_total`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Z, energy })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get cross section');
    }
    
    const data = await response.json();
    return data.cs_total;
  }

  async AtomicWeight(Z: number): Promise<number> {
    if (!this.isLoaded) {
      throw new Error('xraylib not loaded. Call load() first.');
    }
    
    const response = await fetch(`${this.baseUrl}/atomic_weight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Z })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get atomic weight');
    }
    
    const data = await response.json();
    return data.atomic_weight;
  }
}