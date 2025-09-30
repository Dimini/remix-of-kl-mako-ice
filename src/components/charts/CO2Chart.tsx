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
        label: 'CO₂ na obyvateľa (tCO₂/osoba)',
        data: filteredData.map(item => item.value),
        borderColor: 'hsl(0, 70%, 50%)',
        backgroundColor: 'hsla(0, 70%, 50%, 0.1)',
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
          text: 'Rok',
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
          text: 'CO₂ na obyvateľa (tCO₂/osoba)',
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
    <div className="bg-white rounded-none border border-gray-200 p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-black mb-2">Emisie CO₂ na obyvateľa</h3>
          <p className="text-gray-600">Uhlíková stopa Slovenska v čase</p>
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
      
      <div className="text-xs text-gray-500 border-t pt-4">
        <p>Zdroj údajov: World Bank Open Data API • Najnovšie: {data.latest.year} ({data.latest.value.toFixed(2)} tCO₂/osoba)</p>
      </div>
    </div>
  );
}