import { useState, useEffect } from 'react';
import DataPanel from './DataPanel';
import RechartsCharts from './RechartsCharts';
import ChartJsCharts from './ChartJsCharts';
import './AnalyticsDashboard.css';

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7days'); // 7days, 30days, 90days, all
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulated data - replace with actual API call
      const mockMetrics = {
        searchestoday: {
          value: 1254,
          label: 'Medicines searched today',
          icon: '🔍',
          trend: 'up',
          trendValue: 12
        },
        activepharmacies: {
          value: 87,
          label: 'Active pharmacies',
          icon: '💊',
          trend: 'up',
          trendValue: 5
        },
        stockavailability: {
          value: 94,
          label: 'Avg stock level',
          icon: '📦',
          trend: 'up',
          trendValue: 3,
          format: 'percentage'
        },
        customerrating: {
          value: 4.8,
          label: 'Customer rating',
          icon: '⭐',
          trend: 'up',
          trendValue: 0.2,
          decimals: 1
        }
      };

      const mockChartData = {
        daily: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Searches',
              data: [120, 145, 165, 132, 178, 142, 156],
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Reservations',
              data: [45, 52, 68, 42, 78, 55, 62],
              borderColor: '#764ba2',
              backgroundColor: 'rgba(118, 75, 162, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        stockStatus: [
          { name: 'In Stock', value: 2456, color: '#51cf66' },
          { name: 'Low Stock', value: 589, color: '#ffd43b' },
          { name: 'Out of Stock', value: 342, color: '#ff6b6b' }
        ],
        phramacycCategories: {
          labels: ['Well Stocked', 'Good', 'Fair', 'Low', 'Critical'],
          datasets: [
            {
              label: 'Pharmacies',
              data: [35, 28, 18, 12, 7],
              backgroundColor: [
                '#51cf66',
                '#4dabf7',
                '#ffd43b',
                '#ff922b',
                '#ff6b6b'
              ],
              borderColor: 'white',
              borderWidth: 2
            }
          ]
        }
      };

      setMetrics(mockMetrics);
      setChartData(mockChartData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h2>📊 Analytics Dashboard</h2>
        
        {/* Time Range Selector */}
        <div className="time-range-selector">
          <button
            className={`range-btn ${timeRange === '7days' ? 'active' : ''}`}
            onClick={() => setTimeRange('7days')}
          >
            7 Days
          </button>
          <button
            className={`range-btn ${timeRange === '30days' ? 'active' : ''}`}
            onClick={() => setTimeRange('30days')}
          >
            30 Days
          </button>
          <button
            className={`range-btn ${timeRange === '90days' ? 'active' : ''}`}
            onClick={() => setTimeRange('90days')}
          >
            90 Days
          </button>
          <button
            className={`range-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          {metrics && (
            <div className="metrics-grid">
              <DataPanel
                title="Searches Today"
                icon="🔍"
                value={metrics.searchestoday.value}
                label={metrics.searchestoday.label}
                format="number"
                trend={metrics.searchestoday.trend}
                trendValue={metrics.searchestoday.trendValue}
                progress={{
                  current: metrics.searchestoday.value,
                  max: 2000,
                  type: 'success'
                }}
                progressLabel="Daily Goal"
              />
              <DataPanel
                title="Active Pharmacies"
                icon="💊"
                value={metrics.activepharmacies.value}
                label={metrics.activepharmacies.label}
                trend={metrics.activepharmacies.trend}
                trendValue={metrics.activepharmacies.trendValue}
                progress={{
                  current: metrics.activepharmacies.value,
                  max: 150,
                  type: 'warning'
                }}
                progressLabel="Network Coverage"
              />
              <DataPanel
                title="Stock Availability"
                icon="📦"
                value={metrics.stockavailability.value}
                label={metrics.stockavailability.label}
                format="percentage"
                trend={metrics.stockavailability.trend}
                trendValue={metrics.stockavailability.trendValue}
                progress={{
                  current: metrics.stockavailability.value,
                  max: 100,
                  type: 'success'
                }}
                progressLabel="Inventory Level"
              />
              <DataPanel
                title="Customer Rating"
                icon="⭐"
                value={metrics.customerrating.value}
                label={metrics.customerrating.label}
                decimals={1}
                trend={metrics.customerrating.trend}
                trendValue={metrics.customerrating.trendValue}
                metrics={[
                  { label: 'Reviews', value: '1,245' },
                  { label: 'Avg Rating', value: metrics.customerrating.value }
                ]}
              />
            </div>
          )}

          {/* Charts Section */}
          {chartData && (
            <div className="charts-section">
              <div className="charts-row">
                {/* Daily Activity - Recharts Line Chart */}
                <div className="chart-container">
                  <RechartsCharts
                    type="area"
                    data={[
                      { name: 'Mon', Searches: 120, Reservations: 45 },
                      { name: 'Tue', Searches: 145, Reservations: 52 },
                      { name: 'Wed', Searches: 165, Reservations: 68 },
                      { name: 'Thu', Searches: 132, Reservations: 42 },
                      { name: 'Fri', Searches: 178, Reservations: 78 },
                      { name: 'Sat', Searches: 142, Reservations: 55 },
                      { name: 'Sun', Searches: 156, Reservations: 62 }
                    ]}
                    title="📈 Daily Activity (Searches & Reservations)"
                  />
                </div>

                {/* Stock Status - Recharts Pie Chart */}
                <div className="chart-container">
                  <RechartsCharts
                    type="pie"
                    data={[
                      { name: 'In Stock', value: 2456 },
                      { name: 'Low Stock', value: 589 },
                      { name: 'Out of Stock', value: 342 }
                    ]}
                    title="📦 Stock Status Distribution"
                  />
                </div>
              </div>

              <div className="charts-row">
                {/* Pharmacy Categories - Chart.js Bar Chart */}
                <div className="chart-container">
                  <ChartJsCharts
                    type="bar"
                    data={{
                      labels: ['Well Stocked', 'Good', 'Fair', 'Low', 'Critical'],
                      datasets: [
                        {
                          label: 'Number of Pharmacies',
                          data: [35, 28, 18, 12, 7],
                          backgroundColor: [
                            'rgba(81, 207, 102, 0.7)',
                            'rgba(77, 171, 247, 0.7)',
                            'rgba(255, 212, 59, 0.7)',
                            'rgba(255, 146, 43, 0.7)',
                            'rgba(255, 107, 107, 0.7)'
                          ],
                          borderColor: [
                            '#51cf66',
                            '#4dabf7',
                            '#ffd43b',
                            '#ff922b',
                            '#ff6b6b'
                          ],
                          borderWidth: 2,
                          borderRadius: 8
                        }
                      ]
                    }}
                    title="🏥 Pharmacy Stock Categories"
                  />
                </div>

                {/* Medicine Categories - Chart.js Doughnut */}
                <div className="chart-container">
                  <ChartJsCharts
                    type="doughnut"
                    data={{
                      labels: ['Pain Relief', 'Cold & Flu', 'Vitamins', 'Antibiotics', 'Digestive'],
                      datasets: [
                        {
                          label: 'Searches by Category',
                          data: [345, 289, 267, 234, 178],
                          backgroundColor: [
                            'rgba(102, 126, 234, 0.7)',
                            'rgba(118, 75, 162, 0.7)',
                            'rgba(240, 147, 251, 0.7)',
                            'rgba(77, 171, 247, 0.7)',
                            'rgba(81, 207, 102, 0.7)'
                          ],
                          borderColor: 'white',
                          borderWidth: 3
                        }
                      ]
                    }}
                    title="💊 Top Medicine Categories"
                  />
                </div>
              </div>

              {/* Performance Metrics - Recharts Bar Chart */}
              <div className="charts-row full-width">
                <div className="chart-container">
                  <RechartsCharts
                    type="bar"
                    data={[
                      { name: 'Week 1', 'Avg Response Time': 45, 'Delivery Time': 2.5, 'Satisfaction': 92 },
                      { name: 'Week 2', 'Avg Response Time': 42, 'Delivery Time': 2.3, 'Satisfaction': 94 },
                      { name: 'Week 3', 'Avg Response Time': 38, 'Delivery Time': 2.1, 'Satisfaction': 96 },
                      { name: 'Week 4', 'Avg Response Time': 35, 'Delivery Time': 1.9, 'Satisfaction': 97 }
                    ]}
                    title="📊 Weekly Performance Metrics"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
