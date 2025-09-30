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
  
  // Define colors directly with HSL values
  const colors = [
    'hsl(270, 65%, 55%)',  // nuclear-purple
    'hsl(200, 80%, 50%)',  // hydro-blue
    'hsl(25, 40%, 30%)',   // coal-brown
    'hsl(30, 85%, 55%)',   // gas-orange
    'hsl(185, 70%, 45%)',  // wind-cyan
    'hsl(45, 100%, 55%)',  // solar-yellow
    'hsl(120, 60%, 35%)',  // renewable-green
    'hsl(0, 60%, 40%)',    // oil-red
  ];
  
  const chartData = {
    labels: [
      'Jadrová',
      'Vodná',
      'Uhlie',
      'Plyn',
      'Veterná',
      'Solárna',
      'Ostatné obnoviteľné',
      'Ropa'
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
        backgroundColor: colors,
        borderColor: '#ffffff',
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
    <div className="bg-white rounded-none border border-gray-200 p-8">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-black mb-2">Mix výroby elektriny</h3>
        <p className="text-gray-600">Energetické zdroje Slovenska ({electricityMix.year})</p>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="h-64 w-64 flex-shrink-0">
          <Doughnut ref={chartRef} data={chartData} options={options} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-center lg:text-left mb-6">
            <div className="text-3xl font-black text-green-700 mb-1">
              {lowCarbonShare.toFixed(1)}%
            </div>
            <div className="text-gray-600 font-medium">Nízkouhlíková elektrina</div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="font-medium">
                <span className="text-gray-700">Jadrová:</span> {electricityMix.nuclear.toFixed(1)}%
              </div>
              <div className="font-medium">
                <span className="text-gray-700">Vodná:</span> {electricityMix.hydro.toFixed(1)}%
              </div>
              <div className="font-medium">
                <span className="text-gray-700">Veterná:</span> {electricityMix.wind.toFixed(1)}%
              </div>
              <div className="font-medium">
                <span className="text-gray-700">Solárna:</span> {electricityMix.solar.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-gray-500 border-t pt-4">
        <p>Zdroj údajov: Our World in Data (GitHub CSV API) • Rok: {electricityMix.year} • Nízkouhlíková = Jadrová + Obnoviteľné</p>
      </div>
    </div>
  );
}