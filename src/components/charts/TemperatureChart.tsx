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
        borderColor: 'hsl(var(--temperature-cool) / 0.6)',
        backgroundColor: 'transparent',
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.1,
      },
      {
        label: '12-mesačný kĺzavý priemer',
        data: filteredRollingData.map((item, index) => {
          // Align rolling average with raw data indices
          const rawIndex = filteredRawData.findIndex(raw => raw.date === item.date);
          return rawIndex >= 0 ? item.value : null;
        }),
        borderColor: 'hsl(var(--temperature-warm))',
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.1,
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
    <div className="bg-card rounded-lg border p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Mesačná priemerná teplota</h3>
          <p className="text-sm text-muted-foreground">Bratislava ako zástupca trendu Slovenska</p>
        </div>
        
        <Select value={timeWindow} onValueChange={setTimeWindow}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky roky</SelectItem>
            <SelectItem value="since-1990">Od roku 1990</SelectItem>
            <SelectItem value="since-2000">Od roku 2000</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-64 sm:h-80">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground space-y-1">
        <p>Zdroj údajov: Open-Meteo ERA5 Archive API • Súradnice Bratislavy: 48.15°N, 17.11°E</p>
        <p className="italic">{data.note}</p>
      </div>
    </div>
  );
}