import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { PrecipitationData, calculateRollingAverage } from '@/services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PrecipitationChartProps {
  data: PrecipitationData;
}

export function PrecipitationChart({ data }: PrecipitationChartProps) {
  // Calculate 5-year rolling average
  const rollingAvg = calculateRollingAverage(data.timeSeries, 5);

  const chartData = {
    labels: data.timeSeries.map((item) => item.date),
    datasets: [
      {
        label: 'Ročné zrážky',
        data: data.timeSeries.map((item) => item.value),
        borderColor: 'hsl(200, 70%, 60%)',
        backgroundColor: 'hsla(200, 70%, 60%, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.1
      },
      {
        label: '5-ročný kĺzavý priemer',
        data: Array(data.timeSeries.length - rollingAvg.length).fill(null).concat(
          rollingAvg.map((item) => item.value)
        ),
        borderColor: 'hsl(210, 100%, 40%)',
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' mm';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Ročné zrážky (mm)',
          font: {
            size: 13,
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Rok',
          font: {
            size: 13,
            weight: 'bold' as const
          }
        },
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 15,
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Ročné zrážky na Slovensku
        </h3>
        <p className="text-sm text-muted-foreground">
          Historický vývoj ročných zrážok s 5-ročným kĺzavým priemerom
        </p>
      </div>
      
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={options} />
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>{data.note}</p>
        <p className="mt-1">
          Zdroj: Open-Meteo ERA5 Historical Weather API
        </p>
      </div>
    </div>
  );
}