# Climate & Slovakia: Setup Instructions

This project displays real-time climate data for Slovakia including CO₂ emissions, temperature trends, and electricity generation mix.

## Quick Start (Recommended for Lovable/Bolt)

1. **Start the backend server first:**
   ```bash
   node server.js
   ```
   The server will start on port 3001 and begin fetching/caching climate data.

2. **In a new terminal, start the frontend:**
   ```bash
   npm run dev
   ```
   The frontend will start on port 8080 and connect to the backend.

3. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API health check: http://localhost:3001/api/health

## Alternative: Use the startup script
```bash
node start.js
```

## Data Sources

The application fetches live data from:
- **World Bank API**: CO₂ emissions per capita for Slovakia
- **Our World in Data**: Electricity generation mix (CSV format)  
- **Open-Meteo**: Historical temperature data for Bratislava

Data is cached for 12 hours to avoid rate limits and improve performance.

## API Endpoints

- `GET /api/co2-per-capita` - Slovakia's CO₂ emissions time series
- `GET /api/electricity-mix` - Latest electricity generation breakdown
- `GET /api/temperature-monthly` - Monthly temperature data (Bratislava proxy)
- `GET /api/health` - Server health and cache status

## Troubleshooting

If you encounter CORS errors:
- Make sure the backend server (port 3001) is running before the frontend
- Check that both servers are accessible from your browser

If data fails to load:
- Check the backend console for API fetch errors
- The application includes fallback data for graceful degradation
- Data sources may occasionally be unavailable - the app will show cached data

## Technology Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Chart.js
- **Backend**: Express.js + Node.js
- **Charts**: react-chartjs-2 with Chart.js
- **UI Components**: shadcn/ui + Radix UI

## Features

✅ Real-time climate data for Slovakia
✅ Interactive charts with time filtering
✅ Responsive design (mobile-friendly)
✅ Accessibility features (ARIA labels, color-blind friendly)
✅ SEO optimized with proper meta tags
✅ Error handling and graceful fallbacks
✅ Data caching (12-hour TTL)
✅ Educational content about climate impacts

## Deployment Notes

For production deployment:
1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Consider using PM2 or similar for process management
4. Set up proper logging and monitoring