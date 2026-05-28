// components/dashboard/AlertDistributionChart.tsx

'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { AlertFeature } from '@/types/alert';
import { CHART_COLORS } from '@/utils/constants';

interface AlertDistributionChartProps {
  alerts: AlertFeature[];
}

export function AlertDistributionChart({ alerts }: AlertDistributionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Contar alertas por severidad
    const counts = {
      Critical: 0,
      Severe: 0,
      Moderate: 0,
      Minor: 0
    };

    alerts.forEach(a => {
      const sev = a.properties.severity || 'Minor';
      if (sev === 'Extreme' || sev === 'Critical') counts.Critical++;
      else if (sev === 'Severe' || sev === 'High') counts.Severe++;
      else if (sev === 'Moderate') counts.Moderate++;
      else counts.Minor++;
    });

    // Destruir gráfico anterior si existe
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Crear nuevo gráfico
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Critical', 'Severe', 'Moderate', 'Minor'],
        datasets: [
          {
            label: 'Alert Count',
            data: [counts.Critical, counts.Severe, counts.Moderate, counts.Minor],
            backgroundColor: ['#ef444488', '#f9731688', '#eab30888', '#94a3b888'],
            borderColor: ['#ef4444', '#f97316', '#eab308', '#94a3b8'],
            borderWidth: 1.5,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: '#64748b', font: { size: 9, family: 'Rajdhani' } },
            grid: { color: 'rgba(30,58,95,.4)' },
            border: { color: 'transparent' }
          },
          y: {
            ticks: { color: '#64748b', font: { size: 9 } },
            grid: { color: 'rgba(30,58,95,.4)' },
            border: { color: 'transparent' }
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [alerts]);

  return (
    <div className="chart-wrap">
      <div style={{ position: 'relative', height: '180px' }}>
        <canvas ref={canvasRef} role="img" aria-label="Bar chart showing alerts by severity level." />
      </div>
    </div>
  );
}
