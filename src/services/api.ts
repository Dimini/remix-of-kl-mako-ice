// API service for fetching climate data from our Express server

const API_BASE_URL = 'http://localhost:3001/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  fallback?: T;
}

async function fetchWithTimeout(url: string, timeout: number = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export interface CO2Data {
  timeSeries: Array<{ year: number; value: number }>;
  latest: { year: number; value: number };
  lastUpdated: string;
}

export interface ElectricityMix {
  year: number;
  coal: number;
  gas: number;
  oil: number;
  nuclear: number;
  hydro: number;
  wind: number;
  solar: number;
  other_renewables: number;
}

export interface ElectricityData {
  electricityMix: ElectricityMix;
  lastUpdated: string;
}

export interface TemperatureData {
  timeSeries: Array<{ date: string; value: number }>;
  lastUpdated: string;
  note: string;
}

export async function fetchCO2Data(): Promise<CO2Data | null> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/co2-per-capita`);
    const result = await response.json() as ApiResponse<CO2Data>;
    
    if (result.error && result.fallback) {
      console.warn('Using fallback CO2 data:', result.message);
      return result.fallback;
    }
    
    return result as CO2Data;
  } catch (error) {
    console.error('Failed to fetch CO2 data:', error);
    return null;
  }
}

export async function fetchElectricityData(): Promise<ElectricityData | null> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/electricity-mix`);
    const result = await response.json() as ApiResponse<ElectricityData>;
    
    if (result.error && result.fallback) {
      console.warn('Using fallback electricity data:', result.message);
      return result.fallback;
    }
    
    return result as ElectricityData;
  } catch (error) {
    console.error('Failed to fetch electricity data:', error);
    return null;
  }
}

export async function fetchTemperatureData(): Promise<TemperatureData | null> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/temperature-monthly`);
    const result = await response.json() as ApiResponse<TemperatureData>;
    
    if (result.error && result.fallback) {
      console.warn('Using fallback temperature data:', result.message);
      return result.fallback;
    }
    
    return result as TemperatureData;
  } catch (error) {
    console.error('Failed to fetch temperature data:', error);
    return null;
  }
}

// Helper function to calculate rolling average
export function calculateRollingAverage(data: Array<{ date: string; value: number }>, windowSize: number = 12): Array<{ date: string; value: number }> {
  const result: Array<{ date: string; value: number }> = [];
  
  for (let i = windowSize - 1; i < data.length; i++) {
    const windowData = data.slice(i - windowSize + 1, i + 1);
    const average = windowData.reduce((sum, item) => sum + item.value, 0) / windowSize;
    result.push({
      date: data[i].date,
      value: Number(average.toFixed(2))
    });
  }
  
  return result;
}

// Helper function to compute warming since baseline
export function calculateWarmingSince1950(data: Array<{ date: string; value: number }>): number | null {
  const baseline1950s = data.filter(item => {
    const year = parseInt(item.date.split('-')[0]);
    return year >= 1950 && year <= 1959;
  });
  
  const recent5Years = data.filter(item => {
    const year = parseInt(item.date.split('-')[0]);
    const currentYear = new Date().getFullYear();
    return year >= currentYear - 5 && year <= currentYear - 1;
  });
  
  if (baseline1950s.length === 0 || recent5Years.length === 0) {
    return null;
  }
  
  const baselineAvg = baseline1950s.reduce((sum, item) => sum + item.value, 0) / baseline1950s.length;
  const recentAvg = recent5Years.reduce((sum, item) => sum + item.value, 0) / recent5Years.length;
  
  return Number((recentAvg - baselineAvg).toFixed(1));
}