import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ElectricityData } from '@/services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ElectricityMixChartProps {
  data: ElectricityData;
}

export function ElectricityMixChart({ data }: ElectricityMixChartProps) {
  const chartRef = useRef<ChartJS<'doughnut'>>(null);

  const { electricityMix } = data;
  
  const chartData = {
    labels: [
      'Nuclear',
      'Hydro',
      'Coal',
      'Gas',
      'Wind',
      'Solar',
      'Other Renewables',
      'Oil'
    ],
    datasets: [
      {
        data: [
          electricityMix.nuclear,
          electricityMix.hydro,
          electricityMix.coal,
          electricityMix.gas,
          electricityMix.wind,
          electricityMix.solar,
          electricityMix.other_renewables,
          electricityMix.oil,
        ],
        backgroundColor: [
          'hsl(var(--nuclear-purple))',
          'hsl(var(--chart-2))',
          'hsl(var(--fossil-gray))',
          'hsl(var(--chart-4))',
          'hsl(var(--chart-5))',
          'hsl(var(--warning))',
          'hsl(var(--renewable-green))',
          'hsl(var(--chart-7))',
        ],
        borderColor: 'hsl(var(--background))',
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels?.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i] as number;
                return {
                  text: `${label}: ${value.toFixed(1)}%`,
                  fillStyle: dataset.backgroundColor?.[i] as string,
                  strokeStyle: dataset.borderColor as string,
                  lineWidth: dataset.borderWidth as number,
                  hidden: false,
                  index: i,
                  pointStyle: 'circle',
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
    cutout: '60%',
  };

  const lowCarbonShare = electricityMix.nuclear + electricityMix.hydro + electricityMix.wind + electricityMix.solar + electricityMix.other_renewables;

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Electricity Generation Mix</h3>
        <p className="text-sm text-muted-foreground">Slovakia's power sources ({electricityMix.year})</p>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="h-64 w-64 flex-shrink-0">
          <Doughnut ref={chartRef} data={chartData} options={options} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-center lg:text-left mb-4">
            <div className="text-2xl font-bold text-success">
              {lowCarbonShare.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Low-carbon electricity</div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Nuclear:</span> {electricityMix.nuclear.toFixed(1)}%
              </div>
              <div>
                <span className="font-medium">Hydro:</span> {electricityMix.hydro.toFixed(1)}%
              </div>
              <div>
                <span className="font-medium">Wind:</span> {electricityMix.wind.toFixed(1)}%
              </div>
              <div>
                <span className="font-medium">Solar:</span> {electricityMix.solar.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Data source: Our World in Data • Year: {electricityMix.year} • Low-carbon = Nuclear + Renewables</p>
      </div>
    </div>
  );
}