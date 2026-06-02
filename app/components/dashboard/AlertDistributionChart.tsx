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
            backgroundColor: ['#ef4444', '#f97316', '#eab308', '#94a3b8'],
            borderColor: 'transparent',
            borderWidth: 0,
            borderRadius: 2,
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
            display: false
          },
          tooltip: {
            backgroundColor: '#0a1b3a',
            titleColor: '#FFD700',
            bodyColor: '#e2e8f0',
            borderColor: '#1e3a8a',
            borderWidth: 1,
            padding: 8
          }
        },
        scales: {
          x: {
            stacked: false,
            ticks: {
              color: '#94a3b8',
              font: { size: 9 },
              stepSize: 1
            },
            grid: {
              color: '#1e3a8a'
            }
          },
          y: {
            ticks: {
              color: '#e2e8f0',
              font: { size: 10, weight: 'bold' }
            },
            grid: {
              display: false // Sin líneas de rejilla en el eje Y para limpiar el diseño
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
      <div className="bg-[#0a204a] border border-[#1e3a8a] rounded p-2">
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