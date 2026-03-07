import './ProgressBar.css';

export default function ProgressBar({ 
  value = 0, 
  max = 100, 
  label = '', 
  showPercentage = true,
  type = 'default', // default, success, warning, danger
  animated = true,
  height = 'medium'
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getType = () => {
    if (type === 'custom') return 'custom';
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    if (percentage < 30) return 'danger';
    return type;
  };

  const displayType = type === 'default' ? getType() : type;

  return (
    <div className="progress-bar-container">
      {label && (
        <div className="progress-header">
          <span className="progress-label">{label}</span>
          {showPercentage && <span className="progress-percentage">{Math.round(percentage)}%</span>}
        </div>
      )}
      
      <div className={`progress-bar ${displayType} ${height} ${animated ? 'animated' : ''}`}>
        <div 
          className="progress-fill"
          style={{ 
            width: `${percentage}%`,
            animation: animated ? `fillAnimation 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)` : 'none'
          }}
        >
          {percentage > 10 && showPercentage && (
            <span className="progress-text">{Math.round(percentage)}%</span>
          )}
        </div>
      </div>

      {showPercentage && (
        <div className="progress-stats">
          <span className="stat">{value}</span>
          <span className="stat-separator">/</span>
          <span className="stat">{max}</span>
        </div>
      )}
    </div>
  );
}
