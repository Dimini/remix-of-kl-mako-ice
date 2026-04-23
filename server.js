import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for the frontend
app.use(cors());
app.use(express.json());

// In-memory cache with 12-hour TTL
const cache = new Map();
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Cache hit for ${key}`);
    return cached.data;
  }
  console.log(`Cache miss for ${key}`);
  return null;
}

function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`Cached data for ${key}`);
}

// Route 1: CO2 emissions per capita for Slovakia
app.get('/api/co2-per-capita', async (req, res) => {
  try {
    const cacheKey = 'co2-per-capita-slovakia';
    let cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    console.log('Fetching CO2 data from World Bank API...');
    const response = await fetch(
      'https://api.worldbank.org/v2/country/SVK/indicator/EN.ATM.CO2E.PC?format=json&per_page=100',
      { timeout: 10000 }
    );
    
    if (!response.ok) {
      throw new Error(`World Bank API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length < 2) {
      throw new Error('Invalid response format from World Bank API');
    }

    const timeSeries = data[1]
      .filter(item => item.value !== null && item.value !== undefined)
      .map(item => ({
        year: parseInt(item.date),
        value: parseFloat(item.value)
      }))
      .sort((a, b) => a.year - b.year);

    const latestData = timeSeries[timeSeries.length - 1];
    
    const result = {
      timeSeries,
      latest: latestData,
      lastUpdated: new Date().toISOString()
    };

    setCachedData(cacheKey, result);
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching CO2 data:', error);
    res.status(500).json({
      error: 'Failed to fetch CO2 emissions data',
      detail: 'Upstream data source unavailable.',
      fallback: {
        latest: { year: 2021, value: 6.1 },
        timeSeries: []
      }
    });
  }
});

// Route 2: Electricity generation mix for Slovakia
app.get('/api/electricity-mix', async (req, res) => {
  try {
    const cacheKey = 'electricity-mix-slovakia';
    let cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    console.log('Fetching electricity mix data from Our World in Data...');
    const response = await fetch(
      'https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv',
      { timeout: 15000 }
    );
    
    if (!response.ok) {
      throw new Error(`OWID API responded with status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    // Find Slovakia data
    const slovakiaRows = lines.slice(1)
      .map(line => {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        return row;
      })
      .filter(row => row.country === 'Slovakia' && row.year && !isNaN(parseInt(row.year)))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year));

    if (slovakiaRows.length === 0) {
      throw new Error('No Slovakia data found in OWID dataset');
    }

    const latestRow = slovakiaRows[0];
    const year = parseInt(latestRow.year);
    
    // Extract electricity shares
    const extractShare = (field) => {
      const value = parseFloat(latestRow[field]);
      return isNaN(value) ? 0 : value;
    };
    
    const electricityMix = {
      year,
      coal: extractShare('coal_share_elec') || extractShare('coal_electricity') / extractShare('electricity_generation') * 100 || 0,
      gas: extractShare('gas_share_elec') || extractShare('gas_electricity') / extractShare('electricity_generation') * 100 || 0,
      oil: extractShare('oil_share_elec') || extractShare('oil_electricity') / extractShare('electricity_generation') * 100 || 0,
      nuclear: extractShare('nuclear_share_elec') || extractShare('nuclear_electricity') / extractShare('electricity_generation') * 100 || 0,
      hydro: extractShare('hydro_share_elec') || extractShare('hydro_electricity') / extractShare('electricity_generation') * 100 || 0,
      wind: extractShare('wind_share_elec') || extractShare('wind_electricity') / extractShare('electricity_generation') * 100 || 0,
      solar: extractShare('solar_share_elec') || extractShare('solar_electricity') / extractShare('electricity_generation') * 100 || 0,
      other_renewables: extractShare('other_renewables_share_elec') || 0
    };
    
    const result = {
      electricityMix,
      lastUpdated: new Date().toISOString()
    };

    setCachedData(cacheKey, result);
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching electricity mix data:', error);
    res.status(500).json({
      error: 'Failed to fetch electricity mix data',
      detail: 'Upstream data source unavailable.',
      fallback: {
        electricityMix: {
          year: 2022,
          coal: 12.5,
          gas: 7.8,
          oil: 0.5,
          nuclear: 54.3,
          hydro: 15.2,
          wind: 1.4,
          solar: 2.8,
          other_renewables: 5.5
        }
      }
    });
  }
});

// Route 3: Monthly temperature data for Bratislava (Slovakia proxy)
app.get('/api/temperature-monthly', async (req, res) => {
  try {
    const cacheKey = 'temperature-monthly-bratislava';
    let cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    console.log('Fetching temperature data from Open-Meteo...');
    const response = await fetch(
      'https://archive-api.open-meteo.com/v1/era5?latitude=48.15&longitude=17.11&start_date=1950-01-01&end_date=2024-12-31&monthly=temperature_2m_mean&timezone=Europe%2FBratislava',
      { timeout: 15000 }
    );
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.monthly || !data.monthly.time || !data.monthly.temperature_2m_mean) {
      throw new Error('Invalid response format from Open-Meteo API');
    }

    const timeSeries = data.monthly.time.map((date, index) => ({
      date,
      value: data.monthly.temperature_2m_mean[index]
    })).filter(item => item.value !== null);
    
    const result = {
      timeSeries,
      lastUpdated: new Date().toISOString(),
      note: "City-level series used as a proxy for national trend; for rigorous analysis, use national-average datasets."
    };

    setCachedData(cacheKey, result);
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching temperature data:', error);
    res.status(500).json({
      error: 'Failed to fetch temperature data',
      detail: 'Upstream data source unavailable.',
      fallback: {
        timeSeries: [],
        note: "City-level series used as a proxy for national trend; for rigorous analysis, use national-average datasets."
      }
    });
  }
});

// Health check endpoint — returns minimal status only.
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Climate data server running on port ${PORT}`);
});