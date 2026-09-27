import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Typography, ButtonGroup, Button, useTheme } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { BsbCard } from 'components/adminbsb';
import { formatCurrency } from '@hinov/core';
import { computeCashFlowEvolution } from '../utils/evolutionAnalytics';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function CashFlowEvolutionChart({ mouvements = [] }) {
  const theme = useTheme();
  const [monthsCount, setMonthsCount] = useState(6);

  const { categories, series, totals } = useMemo(() => {
    return computeCashFlowEvolution(mouvements, monthsCount);
  }, [mouvements, monthsCount]);

  const chartOptions = useMemo(() => {
    return {
      chart: {
        height: 320,
        type: 'line',
        toolbar: { show: false },
        fontFamily: theme.typography.fontFamily || 'Poppins, sans-serif'
      },
      stroke: {
        width: [0, 0, 3],
        curve: 'smooth'
      },
      colors: ['#4CAF50', '#F44336', '#0288D1'], // Vert pour Entrées, Rouge pour Sorties, Bleu pour Net
      plotOptions: {
        bar: {
          columnWidth: '45%',
          borderRadius: 4
        }
      },
      fill: {
        opacity: [0.85, 0.85, 1],
        gradient: {
          inverseColors: false,
          shade: 'light',
          type: 'vertical',
          opacityFrom: 0.85,
          opacityTo: 0.55
        }
      },
      labels: categories,
      markers: {
        size: [0, 0, 5],
        strokeWidth: 2,
        hover: { size: 7 }
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
            fontSize: '11px'
          },
          formatter: (value) => {
            if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)} M`;
            if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)} k`;
            return value;
          }
        }
      },
      tooltip: {
        theme: 'light',
        shared: true,
        intersect: false,
        y: {
          formatter: (val) => formatCurrency(val)
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '13px',
        fontWeight: 600
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4
      }
    };
  }, [categories, theme]);

  return (
    <BsbCard
      title="DYNAMIQUE DES FLUX DE TRÉSORERIE"
      subtitle="Encaissements (Entrées), Décaissements (Dépenses) et Flux Net"
      headerAction={
        <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: '#fff' }}>
          <Button
            variant={monthsCount === 3 ? 'contained' : 'outlined'}
            onClick={() => setMonthsCount(3)}
            sx={{ fontWeight: 700, textTransform: 'none', px: 1.2 }}
          >
            3 mois
          </Button>
          <Button
            variant={monthsCount === 6 ? 'contained' : 'outlined'}
            onClick={() => setMonthsCount(6)}
            sx={{ fontWeight: 700, textTransform: 'none', px: 1.2 }}
          >
            6 mois
          </Button>
          <Button
            variant={monthsCount === 12 ? 'contained' : 'outlined'}
            onClick={() => setMonthsCount(12)}
            sx={{ fontWeight: 700, textTransform: 'none', px: 1.2 }}
          >
            12 mois
          </Button>
        </ButtonGroup>
      }
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}
        justifyContent="space-around"
      >
        <Box textAlign={{ xs: 'left', sm: 'center' }}>
          <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 600 }}>
            Total Encaissements (+)
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#2E7D32' }}>
            {formatCurrency(totals.totalEntrees)}
          </Typography>
        </Box>
        <Box textAlign={{ xs: 'left', sm: 'center' }}>
          <Typography variant="caption" sx={{ color: '#C62828', fontWeight: 600 }}>
            Total Décaissements (-)
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#C62828' }}>
            {formatCurrency(totals.totalSorties)}
          </Typography>
        </Box>
        <Box textAlign={{ xs: 'left', sm: 'center' }}>
          <Typography variant="caption" sx={{ color: '#0288D1', fontWeight: 600 }}>
            Variation Nette Période
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: totals.soldeNet >= 0 ? '#0288D1' : '#E65100'
            }}
          >
            {formatCurrency(totals.soldeNet)}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ minHeight: 320, width: '100%' }}>
        <ReactApexChart
          options={chartOptions}
          series={series}
          type="line"
          height={320}
        />
      </Box>
    </BsbCard>
  );
}

CashFlowEvolutionChart.propTypes = {
  mouvements: PropTypes.array
};
