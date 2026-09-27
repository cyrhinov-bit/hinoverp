import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { BsbCard } from 'components/adminbsb';
import { formatCurrency } from '@hinov/core';
import { computeExpenseDistribution } from '../utils/evolutionAnalytics';
import PieChartIcon from '@mui/icons-material/PieChart';

export default function ExpenseDistributionChart({ mouvements = [] }) {
  const theme = useTheme();

  const { labels, series, totalDepenses } = useMemo(() => {
    return computeExpenseDistribution(mouvements);
  }, [mouvements]);

  const chartOptions = useMemo(() => {
    return {
      chart: {
        type: 'donut',
        height: 320,
        toolbar: { show: false },
        fontFamily: theme.typography.fontFamily || 'Poppins, sans-serif'
      },
      labels: labels,
      colors: ['#E91E63', '#FF9800', '#9C27B0', '#00BCD4', '#4CAF50', '#607D8B'],
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: { show: true, fontSize: '12px', fontWeight: 600, color: '#64748b' },
              value: {
                show: true,
                fontSize: '15px',
                fontWeight: 800,
                color: '#1e293b',
                formatter: (val) => formatCurrency(Number(val))
              },
              total: {
                show: true,
                label: 'Total Dépenses',
                fontSize: '12px',
                fontWeight: 700,
                color: '#64748b',
                formatter: () => formatCurrency(totalDepenses)
              }
            }
          }
        }
      },
      legend: {
        position: 'bottom',
        fontSize: '12px',
        fontWeight: 600,
        markers: { radius: 12 }
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: (val) => formatCurrency(val)
        }
      }
    };
  }, [labels, totalDepenses, theme]);

  return (
    <BsbCard
      title="RÉPARTITION DES DÉPENSES & CHARGES"
      subtitle="Structure des coûts opérationnels par catégorie"
    >
      <Box sx={{ minHeight: 320, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {totalDepenses > 0 ? (
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="donut"
            height={320}
            width="100%"
          />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Aucune dépense enregistrée sur cette sélection.
            </Typography>
          </Box>
        )}
      </Box>
    </BsbCard>
  );
}

ExpenseDistributionChart.propTypes = {
  mouvements: PropTypes.array
};
