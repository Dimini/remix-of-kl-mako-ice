import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TemperatureData, calculateRollingAverage } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TemperatureChartProps {
  data: TemperatureData;
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  const [timeWindow, setTimeWindow] = useState<string>("all");
  const chartRef = useRef<ChartJS<'line'>>(null);

  const rollingAverage = calculateRollingAverage(data.timeSeries, 12);

  const filteredRawData = data.timeSeries.filter(item => {
    const year = parseInt(item.date.split('-')[0]);
    switch (timeWindow) {
      case "since-2000":
        return year >= 2000;
      case "since-1990":
        return year >= 1990;
      default:
        return true;
    }
  });

  const filteredRollingData = rollingAverage.filter(item => {
    const year = parseInt(item.date.split('-')[0]);
    switch (timeWindow) {
      case "since-2000":
        return year >= 2000;
      case "since-1990":
        return year >= 1990;
      default:
        return true;
    }
  });

  const chartData = {
    labels: filteredRawData.map(item => item.date),
    datasets: [
      {
        label: 'Mesačná teplota',
        data: filteredRawData.map(item => item.value),
        borderColor: 'hsla(200, 60%, 70%, 0.4)',
        backgroundColor: 'transparent',
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.1,
        segment: {
          borderColor: (ctx: any) => {
            const value = ctx.p1.parsed.y;
            // Light blue for lows, light orange for highs
            return value > 15 ? 'hsla(30, 100%, 70%, 0.5)' : 'hsla(200, 80%, 70%, 0.5)';
          }
        }
      },
      {
        label: '12-mesačný kĺzavý priemer',
        data: filteredRollingData.map((item, index) => {
          const rawIndex = filteredRawData.findIndex(raw => raw.date === item.date);
          return rawIndex >= 0 ? item.value : null;
        }),
        borderColor: 'hsl(15, 100%, 55%)',
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.1,
        segment: {
          borderColor: (ctx: any) => {
            const value = ctx.p1.parsed.y;
            // Yellow to red gradient based on temperature
            if (value < 8) return 'hsl(45, 100%, 50%)';
            if (value < 10) return 'hsl(35, 100%, 50%)';
            if (value < 12) return 'hsl(25, 100%, 50%)';
            if (value < 14) return 'hsl(15, 100%, 50%)';
            return 'hsl(0, 100%, 50%)';
          }
        }
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}°C`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Rok-Mesiac',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: 'hsl(var(--border))',
        },
        ticks: {
          maxTicksLimit: 10,
          callback: function(value, index) {
            const date = filteredRawData[index]?.date;
            if (date) {
              const [year, month] = date.split('-');
              return month === '01' ? year : ''; // Show only January labels
            }
            return '';
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Teplota (°C)',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: 'hsl(var(--border))',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div className="bg-white rounded-none border border-gray-200 p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-black mb-2">Mesačná priemerná teplota</h3>
          <p className="text-gray-600">Bratislava ako zástupca trendu Slovenska</p>
        </div>
        
        <Select value={timeWindow} onValueChange={setTimeWindow}>
          <SelectTrigger className="w-40 rounded-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky roky</SelectItem>
            <SelectItem value="since-1990">Od roku 1990</SelectItem>
            <SelectItem value="since-2000">Od roku 2000</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-64 sm:h-80 mb-6">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      
      <div className="text-xs text-gray-500 border-t pt-4 space-y-1">
        <p>Zdroj údajov: Open-Meteo ERA5 Archive API • Súradnice Bratislavy: 48.15°N, 17.11°E</p>
        <p className="italic">{data.note}</p>
      </div>
    </div>
  );
}