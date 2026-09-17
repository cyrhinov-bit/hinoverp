import { 
  MouvementCaisse, 
  CatalogueArticle, 
  PrestationCommande, 
  InterventionMaintenance,
  ClientFournisseur,
  AgentCommercial,
  CommissionItem
} from '../types/database';

/**
 * Calcul du solde de caisse en temps réel
 * Formule : Somme(Entrées) - Somme(Sorties)
 */
export function calculateCashBalance(mouvements: MouvementCaisse[]): number {
  return mouvements.reduce((acc, mvt) => {
    const montant = Number(mvt.montant) || 0;
    return mvt.type === 'ENTREE' ? acc + montant : acc - montant;
  }, 0);
}

/**
 * Statistiques complètes de trésorerie (Entrées, Sorties, Solde, Taux de décaissement)
 */
export function calculateCashFlowStats(mouvements: MouvementCaisse[]) {
  let totalEntrees = 0;
  let totalSorties = 0;

  for (const mvt of mouvements) {
    const montant = Number(mvt.montant) || 0;
    if (mvt.type === 'ENTREE') {
      totalEntrees += montant;
    } else if (mvt.type === 'SORTIE') {
      totalSorties += montant;
    }
  }

  const solde = totalEntrees - totalSorties;
  const ratioDecaissement = totalEntrees > 0 ? ((totalSorties / totalEntrees) * 100).toFixed(1) : '0';

  return {
    totalEntrees,
    totalSorties,
    solde,
    ratioDecaissement: Number(ratioDecaissement),
    nombreOperations: mouvements.length
  };
}

/**
 * Calcul des 11 colonnes financières pour une prestation ou ligne de prestation
 * 1. DESIGNATIONS
 * 2. QUANTITES
 * 3. COUT UNITAIRE ACHAT
 * 4. COUT FINAL ACHAT = Quantités * Coût Unitaire Achat
 * 5. MONTANT VENTE UNITAIRE
 * 6. PRIX CLIENT FINAL (Total) = Quantités * Montant Vente Unitaire
 * 7. MARGE INTERNE = Prix Client Final - Coût Final Achat
 * 8. COMMISSION APPORTEUR (10% de base calculé sur Prix Client Final)
 * 9. COMMISSION RESP SERVICE (Saisie)
 * 10. COMMISSION AGENT COMMERCIAL (Saisie)
 * 11. BENEFICE REEL = Marge Interne - (Comm. Apporteur + Comm. Resp + Comm. Commercial)
 */
export function calculatePrestationLine(
  quantite: number = 1,
  coutUnitaireAchat: number = 0,
  prixUnitaireVente: number = 0,
  commissionApporteur: number | null = null,
  commissionResponsable: number = 0,
  commissionCommercial: number = 0,
  tauxApporteurPct: number = 10
) {
  const qte = Number(quantite) > 0 ? Number(quantite) : 1;
  const coutUnit = Number(coutUnitaireAchat) || 0;
  const prixUnit = Number(prixUnitaireVente) || 0;

  // 4. Coût Final Achat
  const coutFinalAchat = qte * coutUnit;

  // 6. Prix Client Final
  const prixClientFinal = qte * prixUnit;

  // 7. Marge Interne
  const margeInterne = prixClientFinal - coutFinalAchat;

  // 8. Commission Apporteur (auto 10% si non spécifié)
  const commApporteur = commissionApporteur !== null && commissionApporteur !== undefined
    ? Number(commissionApporteur)
    : Math.round(prixClientFinal * (tauxApporteurPct / 100));

  const commResp = Number(commissionResponsable) || 0;
  const commCom = Number(commissionCommercial) || 0;
  const totalCommissions = commApporteur + commResp + commCom;

  // 11. Bénéfice Réel
  const beneficeReel = margeInterne - totalCommissions;

  const tauxMarge = coutFinalAchat > 0 ? (margeInterne / coutFinalAchat) * 100 : (prixClientFinal > 0 ? 100 : 0);
  const tauxBeneficeNet = prixClientFinal > 0 ? (beneficeReel / prixClientFinal) * 100 : 0;

  return {
    quantite: qte,
    coutUnitaireAchat: coutUnit,
    coutFinalAchat,
    prixUnitaireVente: prixUnit,
    prixClientFinal,
    margeInterne,
    commissionApporteur: commApporteur,
    commissionResponsable: commResp,
    commissionCommercial: commCom,
    totalCommissions,
    beneficeReel,
    // Alias pour compatibilité
    totalCout: coutFinalAchat,
    totalVente: prixClientFinal,
    margeBrute: margeInterne,
    margeNette: beneficeReel,
    tauxMarge: Number(tauxMarge.toFixed(2)),
    tauxMargeNette: Number(tauxBeneficeNet.toFixed(2))
  };
}

/**
 * Calcul de marge commerciale et de rentabilité
 */
export function calculateProfitMargin(
  coutAchat: number, 
  prixVente: number, 
  quantite: number = 1,
  commissionApporteur: number = 0,
  commissionCommercial: number = 0,
  commissionResponsable: number = 0
) {
  const line = calculatePrestationLine(
    quantite,
    coutAchat,
    prixVente,
    commissionApporteur,
    commissionResponsable,
    commissionCommercial
  );

  return {
    totalVente: line.prixClientFinal,
    totalCout: line.coutFinalAchat,
    margeBrute: line.margeInterne,
    margeInterne: line.margeInterne,
    totalCommissions: line.totalCommissions,
    margeNette: line.beneficeReel,
    beneficeReel: line.beneficeReel,
    tauxMarge: line.tauxMarge,
    tauxMargeNette: line.tauxMargeNette,
    tauxMarque: line.tauxMargeNette
  };
}

/**
 * Calcul de la valorisation du stock et détection des alertes de rupture
 */
export function calculateStockValuation(articles: CatalogueArticle[] = []) {
  let valeurAchatTotale = 0;
  let valeurVenteTotale = 0;
  let articlesEnAlerte: CatalogueArticle[] = [];
  let totalArticlesEnStock = 0;

  const list = Array.isArray(articles) ? articles : [];

  for (const art of list) {
    if (!art) continue;
    const qte = Number(art.quantite_stock !== undefined ? art.quantite_stock : (art as any).quantite) || 0;
    const coutAchat = Number(art.cout_unitaire_achat !== undefined ? art.cout_unitaire_achat : ((art as any).coutAchat || (art as any).cout_achat)) || 0;
    const prixVente = Number(art.prix_unitaire_vente !== undefined ? art.prix_unitaire_vente : ((art as any).prixVente || (art as any).prix_vente || (art as any).prix)) || 0;
    const seuil = Number(art.seuil_alerte !== undefined ? art.seuil_alerte : ((art as any).seuilAlerte || (art as any).seuil)) || 5;

    const valAchat = qte * coutAchat;
    const valVente = qte * prixVente;

    valeurAchatTotale += valAchat;
    valeurVenteTotale += valVente;
    totalArticlesEnStock += qte;

    if (qte <= seuil) {
      articlesEnAlerte.push(art);
    }
  }

  const margePotentielle = valeurVenteTotale - valeurAchatTotale;

  return {
    valeurAchatTotale,
    valeurVenteTotale,
    margePotentielle,
    nombreArticles: list.length,
    totalArticlesEnStock,
    articlesEnAlerte,
    nbAlertes: articlesEnAlerte.length,
    nombreAlertes: articlesEnAlerte.length
  };
}

/**
 * Statistiques des interventions de maintenance
 */
export function calculateMaintenanceStats(interventions: InterventionMaintenance[]) {
  let enAttente = 0;
  let enCours = 0;
  let terminees = 0;
  let annulees = 0;
  let coutTotal = 0;

  for (const item of interventions) {
    coutTotal += Number(item.prix) || 0;
    switch (item.statut) {
      case 'EN_ATTENTE':
        enAttente++;
        break;
      case 'EN_COURS':
        enCours++;
        break;
      case 'TERMINEE':
        terminees++;
        break;
      case 'ANNULEE':
        annulees++;
        break;
    }
  }

  return {
    total: interventions.length,
    enAttente,
    enCours,
    terminees,
    annulees,
    coutTotal
  };
}

/**
 * Calcul global des statistiques sur les prestations et commandes
 */
export function calculatePrestationsStats(prestations: PrestationCommande[]) {
  let chiffreAffairesTotal = 0;
  let coutTotal = 0;
  let margeBruteTotale = 0;
  let totalCommissionsApporteurs = 0;
  let totalCommissionsCommerciaux = 0;
  let totalCommissionsResponsables = 0;
  let margeNetteTotale = 0;

  for (const p of prestations) {
    const vente = Number(p.montant_total_vente) || 0;
    const cout = Number(p.cout_total_revient) || 0;
    const commApporteur = Number(p.commission_apporteur_montant) || (vente * 0.10);
    const commCommercial = Number(p.commission_commercial_montant) || 0;
    const commResponsable = Number(p.commission_responsable_montant) || 0;

    const brute = p.marge_brute !== undefined ? Number(p.marge_brute) : (vente - cout);
    const nette = p.marge_nette !== undefined ? Number(p.marge_nette) : (brute - commApporteur - commCommercial - commResponsable);

    chiffreAffairesTotal += vente;
    coutTotal += cout;
    margeBruteTotale += brute;
    totalCommissionsApporteurs += commApporteur;
    totalCommissionsCommerciaux += commCommercial;
    totalCommissionsResponsables += commResponsable;
    margeNetteTotale += nette;
  }

  const rentabiliteMoyenne = chiffreAffairesTotal > 0 ? (margeNetteTotale / chiffreAffairesTotal) * 100 : 0;

  return {
    totalCommandes: prestations.length,
    chiffreAffairesTotal,
    montantTotalVentes: chiffreAffairesTotal,
    coutTotal,
    coutTotalRevient: coutTotal,
    margeBruteTotale,
    margeInterneTotale: margeBruteTotale,
    totalCommissionsApporteurs,
    totalCommissionsCommerciaux,
    totalCommissionsResponsables,
    totalCommissions: totalCommissionsApporteurs + totalCommissionsCommerciaux + totalCommissionsResponsables,
    margeNetteTotale,
    margeTotale: margeNetteTotale,
    beneficeReelTotal: margeNetteTotale,
    rentabiliteMoyenne: Number(rentabiliteMoyenne.toFixed(2))
  };
}

/**
 * Statistiques du module de Gestion des Commissions
 */
export function calculateCommissionsStats(commissions: CommissionItem[]) {
  let totalGenerees = 0;
  let totalPayees = 0;
  let totalAPayer = 0;
  let totalAValider = 0;
  let totalApporteurs = 0;
  let totalCommerciaux = 0;
  let totalResponsables = 0;

  for (const comm of commissions) {
    const montant = Number(comm.montant_commission) || 0;
    totalGenerees += montant;

    if (comm.type === 'APPORTEUR') {
      totalApporteurs += montant;
    } else if (comm.type === 'AGENT_COMMERCIAL') {
      totalCommerciaux += montant;
    } else if (comm.type === 'RESPONSABLE') {
      totalResponsables += montant;
    }

    if (comm.statut === 'PAYEE') {
      totalPayees += montant;
    } else if (comm.statut === 'A_PAYER') {
      totalAPayer += montant;
    } else if (comm.statut === 'A_VALIDER') {
      totalAValider += montant;
    }
  }

  return {
    totalCommissionsCount: commissions.length,
    totalGenerees,
    totalPayees,
    totalAPayer,
    totalAValider,
    totalRestantADecaisser: totalAPayer + totalAValider,
    totalApporteurs,
    totalCommerciaux,
    totalResponsables
  };
}

/**
 * Statistiques des Agents Commerciaux
 */
export function calculateCommercialsStats(
  commerciaux: AgentCommercial[],
  prestations: PrestationCommande[] = [],
  commissions: CommissionItem[] = []
) {
  const commercialsSummary = commerciaux.map(agent => {
    const agentPrestations = prestations.filter(p => p.commercial_id === agent.id || p.commercial_nom === agent.nom);
    const agentCommissions = commissions.filter(c => c.beneficiaire_id === agent.id || (c.type === 'AGENT_COMMERCIAL' && c.beneficiaire_nom === agent.nom));

    const totalVentes = agentPrestations.reduce((sum, p) => sum + (Number(p.montant_total_vente) || 0), 0);
    const totalCommissionsDues = agentCommissions.reduce((sum, c) => sum + (Number(c.montant_commission) || 0), 0);
    const totalCommissionsPayees = agentCommissions
      .filter(c => c.statut === 'PAYEE')
      .reduce((sum, c) => sum + (Number(c.montant_commission) || 0), 0);

    return {
      ...agent,
      contratsClosCount: agentPrestations.length,
      totalVentes,
      totalCommissionsDues,
      totalCommissionsPayees,
      soldeCommissionsRestant: Math.max(0, totalCommissionsDues - totalCommissionsPayees)
    };
  });

  const totalVentesEquipe = commercialsSummary.reduce((sum, a) => sum + a.totalVentes, 0);
  const totalCommissionsEquipe = commercialsSummary.reduce((sum, a) => sum + a.totalCommissionsDues, 0);

  return {
    agentsCount: commerciaux.length,
    agentsActifsCount: commerciaux.filter(a => a.actif).length,
    totalVentesEquipe,
    totalCommissionsEquipe,
    commercialsSummary
  };
}

/**
 * Calcul des statistiques transversales pour les Clients et Fournisseurs
 */
export function calculateThirdPartyStats(
  tiers: ClientFournisseur[],
  prestations: PrestationCommande[] = [],
  mouvements: MouvementCaisse[] = [],
  interventions: InterventionMaintenance[] = [],
  articles: CatalogueArticle[] = []
) {
  const clients = tiers.filter(t => t.type === 'CLIENT');
  const fournisseurs = tiers.filter(t => t.type === 'FOURNISSEUR');
  const partenaires = tiers.filter(t => t.type === 'PARTENAIRE');

  const totalVentesClients = prestations.reduce((acc, p) => acc + (Number(p.montant_total_vente) || 0), 0);
  
  const totalEncaissementsClients = mouvements
    .filter(m => m.type === 'ENTREE' && (m.tier_type === 'CLIENT' || clients.some(c => c.id === m.tier_id || c.nom === m.tier_nom || c.nom === m.beneficiaire_emetteur)))
    .reduce((acc, m) => acc + (Number(m.montant) || 0), 0);

  const totalDecaissementsFournisseurs = mouvements
    .filter(m => m.type === 'SORTIE' && (m.tier_type === 'FOURNISSEUR' || fournisseurs.some(f => f.id === m.tier_id || f.nom === m.tier_nom || f.nom === m.beneficiaire_emetteur)))
    .reduce((acc, m) => acc + (Number(m.montant) || 0), 0);

  const totalMargeClients = prestations.reduce((acc, p) => {
    const v = Number(p.montant_total_vente) || 0;
    const c = Number(p.cout_total_revient) || 0;
    const commApp = Number(p.commission_apporteur_montant) || (v * 0.10);
    const commCom = Number(p.commission_commercial_montant) || 0;
    return acc + (p.marge_nette !== undefined ? Number(p.marge_nette) : (v - c - commApp - commCom));
  }, 0);

  const clientsSummary = clients.map(client => {
    const clientPrestations = prestations.filter(p => p.client_id === client.id || p.client_nom === client.nom);
    const clientInterventions = interventions.filter(i => i.client_id === client.id || i.client_nom === client.nom);
    const ca = clientPrestations.reduce((sum, p) => sum + (Number(p.montant_total_vente) || 0), 0);
    const marge = clientPrestations.reduce((sum, p) => {
      const v = Number(p.montant_total_vente) || 0;
      const c = Number(p.cout_total_revient) || 0;
      const commApp = Number(p.commission_apporteur_montant) || (v * 0.10);
      const commCom = Number(p.commission_commercial_montant) || 0;
      return sum + (p.marge_nette !== undefined ? Number(p.marge_nette) : (v - c - commApp - commCom));
    }, 0);
    const encaisse = mouvements
      .filter(m => m.type === 'ENTREE' && (m.tier_id === client.id || m.tier_nom === client.nom || m.beneficiaire_emetteur === client.nom))
      .reduce((sum, m) => sum + (Number(m.montant) || 0), 0);

    return {
      ...client,
      ca,
      marge,
      encaisse,
      soldeRestant: Math.max(0, ca - encaisse),
      commandesCount: clientPrestations.length,
      interventionsCount: clientInterventions.length
    };
  });

  const fournisseursSummary = fournisseurs.map(fournisseur => {
    const fournisseurArticles = articles.filter(a => a.fournisseur_id === fournisseur.id || a.fournisseur_nom === fournisseur.nom);
    const decaisse = mouvements
      .filter(m => m.type === 'SORTIE' && (m.tier_id === fournisseur.id || m.tier_nom === fournisseur.nom || m.beneficiaire_emetteur === fournisseur.nom))
      .reduce((sum, m) => sum + (Number(m.montant) || 0), 0);

    return {
      ...fournisseur,
      articlesCount: fournisseurArticles.length,
      totalAchatsPayes: decaisse
    };
  });

  return {
    totalTiers: tiers.length,
    clientsCount: clients.length,
    fournisseursCount: fournisseurs.length,
    partenairesCount: partenaires.length,
    totalVentesClients,
    totalEncaissementsClients,
    totalDecaissementsFournisseurs,
    totalMargeClients,
    clientsSummary,
    fournisseursSummary
  };
}

/**
 * Formatage des devises (ex: Franc CFA / EUR)
 */
export function formatCurrency(amount: any, currency: string = 'FCFA'): string {
  const numericAmount = typeof amount === 'number' && !isNaN(amount) ? amount : (Number(amount) || 0);
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0
  }).format(numericAmount) + ' ' + currency;
}
