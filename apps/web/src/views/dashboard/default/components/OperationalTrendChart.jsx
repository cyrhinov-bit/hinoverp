import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Typography, ButtonGroup, Button, useTheme } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { BsbCard } from 'components/adminbsb';
import { computeOperationalTrend } from '../utils/evolutionAnalytics';

export default function OperationalTrendChart({ 
  prestations = [], 
  interventions = [],
  canPrestations = true,
  canMaintenance = true
}) {
  const theme = useTheme();
  const [monthsCount, setMonthsCount] = useState(6);

  const { categories, series: allSeries, totals } = useMemo(() => {
    return computeOperationalTrend(prestations, interventions, monthsCount);
  }, [prestations, interventions, monthsCount]);

  // Filtrer les séries selon les habilitations effectives de l'utilisateur
  const { filteredSeries, chartColors } = useMemo(() => {
    const s = [];
    const colors = [];

    if (canPrestations) {
      const prestSerie = allSeries.find(item => item.name.includes('Prestations'));
      if (prestSerie) {
        s.push(prestSerie);
        colors.push('#3F51B5');
      }
    }

    if (canMaintenance) {
      const maintSerie = allSeries.find(item => item.name.includes('Maintenance'));
      if (maintSerie) {
        s.push(maintSerie);
        colors.push('#009688');
      }
    }

    return { filteredSeries: s, chartColors: colors };
  }, [allSeries, canPrestations, canMaintenance]);

  const subtitle = useMemo(() => {
    if (canPrestations && canMaintenance) {
      return "Cadence mensuelle : Prestations commerciales conclues vs Interventions maintenance";
    }
    if (canPrestations) {
      return "Cadence mensuelle des prestations et dossiers de ventes conclus";
    }
    if (canMaintenance) {
      return "Cadence mensuelle des interventions techniques de maintenance réalisées";
    }
    return "Volume d'activité opérationnelle";
  }, [canPrestations, canMaintenance]);

  const chartOptions = useMemo(() => {
    return {
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        fontFamily: theme.typography.fontFamily || 'Poppins, sans-serif'
      },
      colors: chartColors,
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: filteredSeries.length === 1 ? '35%' : '45%',
          borderRadius: 4
        }
      },
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
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
        title: { text: "Nombre d'opérations", style: { color: '#64748b', fontSize: '11px' } },
        labels: {
          style: { colors: '#64748b', fontSize: '11px' }
        }
      },
      fill: { opacity: 1 },
      tooltip: {
        theme: 'light',
        y: {
          formatter: (val) => `${val} opérations`
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
  }, [categories, chartColors, filteredSeries.length, theme]);

  if (!canPrestations && !canMaintenance) return null;

  return (
    <BsbCard
      title="VOLUME D'ACTIVITÉ OPÉRATIONNELLE"
      subtitle={subtitle}
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
        </ButtonGroup>
      }
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}
        justifyContent="space-around"
      >
        {canPrestations && (
          <Box textAlign={{ xs: 'left', sm: 'center' }}>
            <Typography variant="caption" sx={{ color: '#3F51B5', fontWeight: 600 }}>
              Total Prestations Conclues
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#3F51B5' }}>
              {totals.totalPrestations} dossiers
            </Typography>
          </Box>
        )}
        {canMaintenance && (
          <Box textAlign={{ xs: 'left', sm: 'center' }}>
            <Typography variant="caption" sx={{ color: '#009688', fontWeight: 600 }}>
              Total Interventions Réalisées
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#009688' }}>
              {totals.totalInterventions} interventions
            </Typography>
          </Box>
        )}
      </Stack>

      <Box sx={{ minHeight: 300, width: '100%' }}>
        <ReactApexChart
          options={chartOptions}
          series={filteredSeries}
          type="bar"
          height={300}
        />
      </Box>
    </BsbCard>
  );
}

OperationalTrendChart.propTypes = {
  prestations: PropTypes.array,
  interventions: PropTypes.array,
  canPrestations: PropTypes.bool,
  canMaintenance: PropTypes.bool
};
