/**
 * Utilitaires d'agrégation temporelle et d'analyse d'évolution pour le Dashboard ERP
 */

const MONTH_NAMES_FR = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'
];

const FULL_MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const CATEGORY_LABELS = {
  ACHATS: 'Achats Fournisseurs',
  FRAIS_GENERAUX: 'Frais Généraux',
  LOYER: 'Loyer & Charges',
  CARBURANT: 'Carburant & Déplacements',
  ELECTRICITE_EAU: 'Utilités (CIE / SODECI)',
  SALAIRES: 'Salaires & Primes',
  COMMISSION: 'Commissions',
  COMMISSIONS: 'Commissions',
  TRANSPORT: 'Transport & Logistique',
  MAINTENANCE: 'Entretien & Réparations',
  RESTAURATION: 'Missions & Repas',
  AUTRE: 'Autres Dépenses'
};

/**
 * Génère la liste des N derniers mois jusqu'au mois courant
 */
export function getLastNMonths(count = 6) {
  const result = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const label = `${MONTH_NAMES_FR[month]} ${String(year).slice(-2)}`;
    const fullLabel = `${FULL_MONTH_NAMES_FR[month]} ${year}`;

    result.push({ key, year, month, label, fullLabel });
  }

  return result;
}

/**
 * Extrait la clé 'YYYY-MM' d'une date
 */
function getMonthKey(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Calcule l'évolution mensuelle du CA et du Bénéfice Réel
 */
export function computeRevenueEvolution(prestations = [], monthsCount = 6) {
  const months = getLastNMonths(monthsCount);
  const dataMap = {};

  months.forEach(m => {
    dataMap[m.key] = { ventes: 0, benefice: 0, count: 0 };
  });

  prestations.forEach(p => {
    const key = getMonthKey(p.date || p.date_creation || p.created_at);
    if (key && dataMap[key]) {
      const vente = Number(p.montant_total_vente || p.chiffre_affaires || p.montant_devis || 0);
      const benefice = Number(p.benefice_reel_total || p.benefice_reel || p.marge_nette || 0);
      dataMap[key].ventes += isNaN(vente) ? 0 : vente;
      dataMap[key].benefice += isNaN(benefice) ? 0 : benefice;
      dataMap[key].count += 1;
    }
  });

  const categories = months.map(m => m.label);
  const ventesData = months.map(m => Math.round(dataMap[m.key].ventes));
  const beneficeData = months.map(m => Math.round(dataMap[m.key].benefice));
  const countData = months.map(m => dataMap[m.key].count);

  const totalVentes = ventesData.reduce((acc, v) => acc + v, 0);
  const totalBenefice = beneficeData.reduce((acc, b) => acc + b, 0);
  const avgMargePct = totalVentes > 0 ? Math.round((totalBenefice / totalVentes) * 100) : 0;

  return {
    categories,
    series: [
      { name: 'Chiffre d\'Affaires (Ventes)', data: ventesData },
      { name: 'Bénéfice Réel (Marge)', data: beneficeData }
    ],
    countData,
    totals: {
      totalVentes,
      totalBenefice,
      avgMargePct
    }
  };
}

/**
 * Calcule l'évolution temporelle des flux de trésorerie (Entrées vs Sorties vs Net)
 */
export function computeCashFlowEvolution(mouvements = [], monthsCount = 6) {
  const months = getLastNMonths(monthsCount);
  const dataMap = {};

  months.forEach(m => {
    dataMap[m.key] = { entrees: 0, sorties: 0, net: 0 };
  });

  mouvements.forEach(m => {
    const key = getMonthKey(m.date || m.created_at);
    if (key && dataMap[key]) {
      const montant = Number(m.montant || 0);
      if (!isNaN(montant)) {
        if (m.type === 'ENTREE') {
          dataMap[key].entrees += montant;
        } else if (m.type === 'SORTIE') {
          dataMap[key].sorties += montant;
        }
      }
    }
  });

  months.forEach(m => {
    dataMap[m.key].net = dataMap[m.key].entrees - dataMap[m.key].sorties;
  });

  const categories = months.map(m => m.label);
  const entreesData = months.map(m => Math.round(dataMap[m.key].entrees));
  const sortiesData = months.map(m => Math.round(dataMap[m.key].sorties));
  const netData = months.map(m => Math.round(dataMap[m.key].net));

  const totalEntrees = entreesData.reduce((acc, v) => acc + v, 0);
  const totalSorties = sortiesData.reduce((acc, v) => acc + v, 0);
  const soldeNet = totalEntrees - totalSorties;

  return {
    categories,
    series: [
      { name: 'Encaissements (Entrées)', data: entreesData, type: 'column' },
      { name: 'Décaissements (Sorties)', data: sortiesData, type: 'column' },
      { name: 'Flux Net de Trésorerie', data: netData, type: 'line' }
    ],
    totals: {
      totalEntrees,
      totalSorties,
      soldeNet
    }
  };
}

/**
 * Calcule la distribution des dépenses par catégorie
 */
export function computeExpenseDistribution(mouvements = []) {
  const categoryMap = {};

  mouvements
    .filter(m => m.type === 'SORTIE')
    .forEach(m => {
      const rawCat = m.categorie || m.module_code || 'AUTRE';
      const label = CATEGORY_LABELS[rawCat] || rawCat || 'Autres Dépenses';
      const amount = Number(m.montant || 0);
      if (!isNaN(amount) && amount > 0) {
        categoryMap[label] = (categoryMap[label] || 0) + amount;
      }
    });

  const entries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  
  // Limiter aux 5 principales catégories + regroupement 'Autres' si besoin
  const topCategories = entries.slice(0, 5);
  const remainingTotal = entries.slice(5).reduce((acc, curr) => acc + curr[1], 0);

  if (remainingTotal > 0) {
    topCategories.push(['Autres Charges', remainingTotal]);
  }

  const labels = topCategories.map(item => item[0]);
  const series = topCategories.map(item => Math.round(item[1]));
  const totalDepenses = series.reduce((acc, v) => acc + v, 0);

  return {
    labels: labels.length > 0 ? labels : ['Aucune dépense'],
    series: series.length > 0 ? series : [0],
    totalDepenses
  };
}

/**
 * Calcule l'évolution du volume opérationnel (Prestations conclues vs Interventions)
 */
export function computeOperationalTrend(prestations = [], interventions = [], monthsCount = 6) {
  const months = getLastNMonths(monthsCount);
  const dataMap = {};

  months.forEach(m => {
    dataMap[m.key] = { prestations: 0, interventions: 0 };
  });

  prestations.forEach(p => {
    const key = getMonthKey(p.date || p.date_creation || p.created_at);
    if (key && dataMap[key]) {
      dataMap[key].prestations += 1;
    }
  });

  interventions.forEach(i => {
    const key = getMonthKey(i.date_intervention || i.created_at);
    if (key && dataMap[key]) {
      dataMap[key].interventions += 1;
    }
  });

  const categories = months.map(m => m.label);
  const prestationsData = months.map(m => dataMap[m.key].prestations);
  const interventionsData = months.map(m => dataMap[m.key].interventions);

  const totalPrestations = prestationsData.reduce((acc, v) => acc + v, 0);
  const totalInterventions = interventionsData.reduce((acc, v) => acc + v, 0);

  return {
    categories,
    series: [
      { name: 'Prestations & Ventes', data: prestationsData },
      { name: 'Interventions Maintenance', data: interventionsData }
    ],
    totals: {
      totalPrestations,
      totalInterventions
    }
  };
}
