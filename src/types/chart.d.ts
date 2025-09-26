// Type definitions for Chart.js components
import 'chart.js';

declare module 'chart.js' {
  interface ChartTypeRegistry {
    line: {
      chartOptions: import('chart.js').ChartOptions<'line'>;
      datasetOptions: import('chart.js').ChartDataset<'line'>;
      defaultDataPoint: [number, number] | number;
      parsedDataType: { x: number; y: number };
      scales: keyof import('chart.js').CartesianScaleTypeRegistry;
    };
    doughnut: {
      chartOptions: import('chart.js').ChartOptions<'doughnut'>;
      datasetOptions: import('chart.js').ChartDataset<'doughnut'>;
      defaultDataPoint: number;
      parsedDataType: { x: number; y: number };
      scales: never;
    };
  }
}