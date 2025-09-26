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
import { CO2Data } from '@/services/api';
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

interface CO2ChartProps {
  data: CO2Data;
}

export function CO2Chart({ data }: CO2ChartProps) {
  const [timeWindow, setTimeWindow] = useState<string>("all");
  const chartRef = useRef<ChartJS<'line'>>(null);

  const filteredData = data.timeSeries.filter(item => {
    switch (timeWindow) {
      case "since-2000":
        return item.year >= 2000;
      case "since-1990":
        return item.year >= 1990;
      default:
        return true;
    }
  });

  const chartData = {
    labels: filteredData.map(item => item.year.toString()),
    datasets: [
      {
        label: 'CO₂ per capita (tCO₂/person)',
        data: filteredData.map(item => item.value),
        borderColor: 'hsl(var(--co2-primary))',
        backgroundColor: 'hsl(var(--co2-primary) / 0.1)',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} tCO₂/person`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: 'hsl(var(--border))',
        },
      },
      y: {
        title: {
          display: true,
          text: 'CO₂ per capita (tCO₂/person)',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: 'hsl(var(--border))',
        },
        beginAtZero: false,
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
          <h3 className="text-lg font-semibold text-card-foreground">CO₂ Emissions per Capita</h3>
          <p className="text-sm text-muted-foreground">Slovakia's carbon footprint over time</p>
        </div>
        
        <Select value={timeWindow} onValueChange={setTimeWindow}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            <SelectItem value="since-1990">Since 1990</SelectItem>
            <SelectItem value="since-2000">Since 2000</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-64 sm:h-80">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Data source: World Bank • Latest: {data.latest.year} ({data.latest.value.toFixed(2)} tCO₂/person)</p>
      </div>
    </div>
  );
}