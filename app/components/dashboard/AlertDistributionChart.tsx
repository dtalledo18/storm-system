// components/dashboard/AlertDistributionChart.tsx

'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { AlertFeature} from "@/app/types/types-alert";

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
            backgroundColor: ['rgba(239, 68, 68, 0.5)', 'rgba(249, 115, 22, 0.5)', 'rgba(234, 179, 8, 0.5)', 'rgba(148, 163, 184, 0.5)'],
            borderColor: ['#ef4444', '#f97316', '#eab308', '#94a3b8'],
            borderWidth: 1.5,
            borderRadius: 4,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
            labels: {
              font: { family: 'Rajdhani, sans-serif', size: 12 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#e2e8f0',
            bodyColor: '#e2e8f0',
            borderColor: '#1e3a5f',
            borderWidth: 1,
            padding: 8,
            titleFont: { family: 'Rajdhani, sans-serif', size: 12, weight: 'bold' },
            bodyFont: { family: 'Rajdhani, sans-serif', size: 11 }
          }
        },
        scales: {
          x: {
            stacked: false,
            ticks: {
              color: '#64748b',
              font: { size: 9, family: 'Rajdhani, sans-serif' },
              stepSize: 1
            },
            grid: {
              color: 'rgba(30, 58, 95, 0.4)'
            }
          },
          y: {
            ticks: {
              color: '#64748b',
              font: { size: 9, family: 'Rajdhani, sans-serif' }
            },
            grid: {
              color: 'rgba(30, 58, 95, 0.4)',
            }
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
      <div className="bg-slate-800 border border-blue-900 rounded p-2">
        <div style={{ position: 'relative', height: '140px' }}>
          <canvas
              ref={canvasRef}
              role="img"
              aria-label="Bar chart showing alerts by severity level."
          />
        </div>
      </div>
  );
}