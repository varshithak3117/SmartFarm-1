/**
 * SmartFarm Chart.js Integration & Analytics Engine
 * Visualizes slope soil hydrology, water consumption by zone, and comparative land metrics.
 * Also provides CSV export functionality.
 */

const AnalyticsEngine = {
  charts: {
    moisture: null,
    waterUsage: null,
    zoneDistribution: null,
    landComparison: null
  },

  init() {
    this.renderAllCharts();
    window.addEventListener('languageChanged', () => this.updateChartLabels());
    window.addEventListener('simulationUpdate', () => this.softUpdateRealtimeData());
  },

  renderAllCharts() {
    this.renderMoistureChart();
    this.renderWaterUsageChart();
    this.renderZoneDistributionChart();
    this.renderLandComparisonChart();
  },

  /**
   * Chart 1: Soil Moisture Across Slopes (% over time)
   * Displays Zone 1 (Upper), Zone 2 (Middle), Zone 3 (Lower)
   */
  renderMoistureChart() {
    const canvas = document.getElementById('moistureTrendsChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.charts.moisture) {
      this.charts.moisture.destroy();
    }

    const labels = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const activeLandId = StorageManager.getActiveLandId();
    const zones = StorageManager.getZonesByLand(activeLandId);
    
    // Fallback if zones not yet loaded
    const z1Moisture = (zones[0] && zones[0].currentMoisture) || 28;
    const z2Moisture = (zones[1] && zones[1].currentMoisture) || 48;
    const z3Moisture = (zones[2] && zones[2].currentMoisture) || 63;

    const ctx = canvas.getContext('2d');
    this.charts.moisture = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: I18N.t('zone1Name') + ' (Upper)',
            data: [38, 35, 31, 26, 24, z1Moisture, z1Moisture, z1Moisture],
            borderColor: '#f59e0b', // Amber / upper dry
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2.5,
            tension: 0.35,
            fill: true
          },
          {
            label: I18N.t('zone2Name') + ' (Middle)',
            data: [54, 52, 50, 48, 47, z2Moisture, z2Moisture, z2Moisture],
            borderColor: '#10b981', // Emerald green
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2.5,
            tension: 0.35,
            fill: true
          },
          {
            label: I18N.t('zone3Name') + ' (Lower)',
            data: [68, 66, 65, 64, 62, z3Moisture, z3Moisture, z3Moisture],
            borderColor: '#3b82f6', // Blue / downhill accumulation
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2.5,
            tension: 0.35,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y}% Moisture`
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: { callback: v => `${v}%` },
            title: { display: true, text: 'Soil Moisture %' }
          }
        }
      }
    });
  },

  /**
   * Chart 2: Daily Water Consumption over the last 7 days
   */
  renderWaterUsageChart() {
    const canvas = document.getElementById('waterUsageTrendsChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.charts.waterUsage) {
      this.charts.waterUsage.destroy();
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const ctx = canvas.getContext('2d');
    this.charts.waterUsage = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Actual Water Used (Litres)',
            data: [1420, 1680, 1290, 850, 1820, 1540, StorageManager.getFarmSummary().waterUsedTodayLitres || 980],
            backgroundColor: '#059669', // Dark emerald
            borderRadius: 6
          },
          {
            label: 'Conventional Sloping Baseline (Litres)',
            data: [2400, 2500, 2400, 2350, 2600, 2450, 2400],
            backgroundColor: '#cbd5e1', // Light grey
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (c) => `${c.dataset.label}: ${c.parsed.y} Litres`
            }
          }
        },
        scales: {
          y: {
            title: { display: true, text: 'Litres' }
          }
        }
      }
    });
  },

  /**
   * Chart 3: Doughnut Chart of Water Distribution across 3 slope zones
   */
  renderZoneDistributionChart() {
    const canvas = document.getElementById('zoneDistributionChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.charts.zoneDistribution) {
      this.charts.zoneDistribution.destroy();
    }

    const activeLandId = StorageManager.getActiveLandId();
    const zones = StorageManager.getZonesByLand(activeLandId);

    const w1 = zones[0] ? parseFloat(zones[0].waterConsumedToday || 180) : 180;
    const w2 = zones[1] ? parseFloat(zones[1].waterConsumedToday || 120) : 120;
    const w3 = zones[2] ? parseFloat(zones[2].waterConsumedToday || 60) : 60;

    const ctx = canvas.getContext('2d');
    this.charts.zoneDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [I18N.t('zone1Name'), I18N.t('zone2Name'), I18N.t('zone3Name')],
        datasets: [
          {
            data: [w1, w2, w3],
            backgroundColor: ['#f59e0b', '#10b981', '#3b82f6'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (c) => ` ${c.label}: ${c.parsed} Litres`
            }
          }
        }
      }
    });
  },

  /**
   * Chart 4: Land-wise Comparison
   */
  renderLandComparisonChart() {
    const canvas = document.getElementById('landComparisonChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.charts.landComparison) {
      this.charts.landComparison.destroy();
    }

    const lands = StorageManager.getLands();
    const labels = lands.map(l => l.name);
    const data = lands.map(l => {
      const zones = StorageManager.getZonesByLand(l.id);
      return zones.reduce((sum, z) => sum + parseFloat(z.waterConsumedToday || 0), 0);
    });

    const ctx = canvas.getContext('2d');
    this.charts.landComparison = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Water Consumed Today (L)',
            data: data,
            backgroundColor: '#0284c7', // Sky blue
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Horizontal bar for easy reading of multiple land names
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            title: { display: true, text: 'Litres' }
          }
        }
      }
    });
  },

  softUpdateRealtimeData() {
    if (this.charts.moisture) {
      const activeLandId = StorageManager.getActiveLandId();
      const zones = StorageManager.getZonesByLand(activeLandId);
      if (zones.length >= 3) {
        this.charts.moisture.data.datasets[0].data[7] = zones[0].currentMoisture;
        this.charts.moisture.data.datasets[1].data[7] = zones[1].currentMoisture;
        this.charts.moisture.data.datasets[2].data[7] = zones[2].currentMoisture;
        this.charts.moisture.update('none');
      }
    }
  },

  updateChartLabels() {
    this.renderAllCharts();
  },

  /**
   * Export all irrigation and sensor records to CSV
   */
  exportCsv() {
    const logs = StorageManager.getIrrigationLogs();
    const lands = StorageManager.getLands();
    const zones = StorageManager.getZones();

    const headers = [
      "Log ID",
      "Land Name",
      "Location",
      "Zone Name",
      "Slope Position",
      "Start Time",
      "Stop Time",
      "Duration (Minutes)",
      "Water Used (Litres)",
      "Operating Mode",
      "Reason for Starting",
      "Reason for Stopping",
      "Hardware Confirmation Status"
    ];

    const rows = logs.map(log => {
      const land = lands.find(l => l.id === log.landId);
      const zone = zones.find(z => z.id === log.zoneId);

      return [
        `"${log.id}"`,
        `"${land ? land.name : log.landId}"`,
        `"${land ? land.location : 'N/A'}"`,
        `"${zone ? zone.name : log.zoneId}"`,
        `"${zone ? zone.slopePosition : 'Slope'}"`,
        `"${log.startTime}"`,
        `"${log.stopTime}"`,
        log.durationMinutes || 0,
        log.waterUsedLitres || 0,
        `"${log.mode}"`,
        `"${log.reasonStart}"`,
        `"${log.reasonStop}"`,
        `"${log.status}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smartfarm_irrigation_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
