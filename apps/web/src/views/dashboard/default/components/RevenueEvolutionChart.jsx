import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Typography, Chip, ButtonGroup, Button, useTheme } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { BsbCard } from 'components/adminbsb';
import { formatCurrency } from '@hinov/core';
import { computeRevenueEvolution } from '../utils/evolutionAnalytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function RevenueEvolutionChart({ prestations = [] }) {
  const theme = useTheme();
  const [monthsCount, setMonthsCount] = useState(6);

  const { categories, series, totals } = useMemo(() => {
    return computeRevenueEvolution(prestations, monthsCount);
  }, [prestations, monthsCount]);

  const chartOptions = useMemo(() => {
    return {
      chart: {
        type: 'area',
        height: 330,
        toolbar: { show: false },
        fontFamily: theme.typography.fontFamily || 'Poppins, sans-serif'
      },
      colors: ['#1976D2', '#00C853'], // Bleu pour CA, Vert pour Bénéfice
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: [3, 2.5]
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: '#64748b',
            fontSize: '12px',
            fontWeight: 600
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#64748b',
            fontSize: '11px',
            fontWeight: 500
          },
          formatter: (value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)} M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)} k`;
            return value;
          }
        }
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: (val) => formatCurrency(val)
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '13px',
        fontWeight: 600,
        markers: { radius: 12 }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4
      }
    };
  }, [categories, theme]);

  return (
    <BsbCard
      title="ÉVOLUTION DU CHIFFRE D'AFFAIRES & BÉNÉFICE RÉEL"
      subtitle="Trajectoire temporelle de la rentabilité et des marges commerciales"
      headerAction={
        <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: '#fff' }}>
          <Button
            variant={monthsCount === 3 ? 'contained' : 'outlined'}
            onClick={() => setMonthsCount(3)}
            sx={{ fontWeight: 700, textTransform: 'none', px: 1.5 }}
          >
            3 mois
          </Button>
          <Button
            variant={monthsCount === 6 ? 'contained' : 'outlined'}
            onClick={() => setMonthsCount(6)}
            sx={{ fontWeight: 700, textTransform: 'none', px: 1.5 }}
          >
            6 mois
          </Button>
          <Button
            variant={monthsCount === 12 ? 'contained' : 'outlined'}
            onClick={() => setMonthsCount(12)}
            sx={{ fontWeight: 700, textTransform: 'none', px: 1.5 }}
          >
            12 mois
          </Button>
        </ButtonGroup>
      }
    >
      {/* Badges de synthèse en haut du graphique */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}
        justifyContent="space-around"
      >
        <Box textAlign={{ xs: 'left', sm: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            Chiffre d'Affaires Période
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1976D2' }}>
            {formatCurrency(totals.totalVentes)}
          </Typography>
        </Box>
        <Box textAlign={{ xs: 'left', sm: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            Bénéfice Réel Consolidé
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#00C853' }}>
            {formatCurrency(totals.totalBenefice)}
          </Typography>
        </Box>
        <Box textAlign={{ xs: 'left', sm: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            Taux de Marge Moyenne
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent={{ xs: 'flex-start', sm: 'center' }}>
            <TrendingUpIcon sx={{ color: '#E91E63', fontSize: 18 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#E91E63' }}>
              {totals.avgMargePct}%
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <Box sx={{ minHeight: 330, width: '100%' }}>
        <ReactApexChart
          options={chartOptions}
          series={series}
          type="area"
          height={330}
        />
      </Box>
    </BsbCard>
  );
}

RevenueEvolutionChart.propTypes = {
  prestations: PropTypes.array
};
