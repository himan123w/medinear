import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie, Radar } from 'react-chartjs-2';
import './ChartJsCharts.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ChartJsCharts({ type = 'line', data = {}, title = '', options = {} }) {
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12, weight: 600 },
          color: '#666',
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#667eea',
        bodyColor: '#666',
        borderColor: '#667eea',
        borderWidth: 2,
        padding: 12,
        displayColors: true,
        boxPadding: 6,
        titleFont: { size: 13, weight: 700 },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        callbacks: {
          labelColor: function(context) {
            return {
              borderColor: context.dataset.borderColor,
              backgroundColor: context.dataset.borderColor
            };
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(102, 126, 234, 0.1)',
          borderColor: '#e8e8f0'
        },
        ticks: {
          color: '#999',
          font: { size: 11, weight: 500 }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#999',
          font: { size: 11, weight: 500 }
        }
      }
    }
  };

  const mergedOptions = { ...commonOptions, ...options };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <Line
            data={data}
            options={{
              ...mergedOptions,
              fill: true,
              tension: 0.4
            }}
          />
        );

      case 'bar':
        return (
          <Bar
            data={data}
            options={{
              ...mergedOptions,
              plugins: {
                ...mergedOptions.plugins,
                filler: { propagate: true }
              }
            }}
          />
        );

      case 'doughnut':
        return (
          <Doughnut
            data={data}
            options={{
              ...mergedOptions,
              plugins: {
                ...mergedOptions.plugins,
                legend: {
                  ...mergedOptions.plugins.legend,
                  position: 'bottom'
                }
              },
              cutout: '60%'
            }}
          />
        );

      case 'pie':
        return (
          <Pie
            data={data}
            options={{
              ...mergedOptions,
              plugins: {
                ...mergedOptions.plugins,
                legend: {
                  ...mergedOptions.plugins.legend,
                  position: 'bottom'
                }
              }
            }}
          />
        );

      case 'radar':
        return (
          <Radar
            data={data}
            options={{
              ...mergedOptions,
              scales: {
                r: {
                  grid: {
                    color: 'rgba(102, 126, 234, 0.1)',
                    drawBorder: false
                  },
                  ticks: {
                    color: '#999',
                    font: { size: 11, weight: 500 }
                  }
                }
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="chartjs-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-wrapper chartjs-wrapper">
        {renderChart()}
      </div>
    </div>
  );
}
