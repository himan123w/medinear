import AnimatedCounter from './AnimatedCounter';
import ProgressBar from './ProgressBar';
import './DataPanel.css';

export default function DataPanel({ 
  title = '',
  icon = '📊',
  value = 0,
  label = '',
  format = 'number',
  progress = null,
  progressLabel = '',
  trend = null,
  trendValue = 0,
  metrics = [], // Array of { label, value }
  backgroundColor = 'gradient',
  size = 'medium'
}) {
  const getTrendColor = () => {
    if (!trend) return '';
    return trend === 'up' ? 'positive' : 'negative';
  };

  const getTrendIcon = () => {
    if (!trend) return '';
    return trend === 'up' ? '📈' : '📉';
  };

  return (
    <div className={`data-panel ${size} ${backgroundColor}`}>
      {/* Header */}
      {title && (
        <div className="panel-header">
          <h3>{title}</h3>
          {trend && (
            <div className={`trend-badge ${getTrendColor()}`}>
              {getTrendIcon()} {Math.abs(trendValue)}%
            </div>
          )}
        </div>
      )}

      {/* Main Counter */}
      <div className="panel-main">
        <AnimatedCounter 
          target={value}
          label={label}
          icon={icon}
          format={format}
        />
      </div>

      {/* Progress Bar */}
      {progress && (
        <div className="panel-progress">
          <ProgressBar 
            value={progress.current}
            max={progress.max}
            label={progressLabel}
            type={progress.type}
            animated={true}
            height="small"
          />
        </div>
      )}

      {/* Additional Metrics */}
      {metrics.length > 0 && (
        <div className="panel-metrics">
          {metrics.map((metric, idx) => (
            <div key={idx} className="metric-item">
              <span className="metric-label">{metric.label}</span>
              <span className="metric-value">{metric.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
