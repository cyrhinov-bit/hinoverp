import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, SafeAreaView, StatusBar } from 'react-native';
import { 
  INITIAL_PROFILES, 
  INITIAL_MODULES, 
  INITIAL_USER_MODULES, 
  INITIAL_INTERVENTIONS, 
  INITIAL_MOUVEMENTS, 
  INITIAL_ARTICLES,
  INITIAL_CLIENTS_FOURNISSEURS,
  INITIAL_PRESTATIONS,
  INITIAL_AGENTS_COMMERCIAUX,
  INITIAL_COMMISSIONS,
  canAccessModule,
  calculateCashBalance,
  calculateStockValuation,
  calculateMaintenanceStats,
  calculateThirdPartyStats,
  calculateCommissionsStats,
  calculateCommercialsStats,
  formatCurrency,
  Profile,
  UserModule
} from '@hinov/core';

export default function App() {
  const [profiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [currentUser, setCurrentUser] = useState<Profile>(INITIAL_PROFILES[0]);
  const [userModules, setUserModules] = useState<UserModule[]>(INITIAL_USER_MODULES);
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');

  // Permissions dynamiques
  const hasTiers = canAccessModule(currentUser, 'CLIENTS_FOURNISSEURS', userModules, INITIAL_MODULES);
  const hasMaintenance = canAccessModule(currentUser, 'MAINTENANCE', userModules, INITIAL_MODULES);
  const hasStocks = canAccessModule(currentUser, 'STOCKS', userModules, INITIAL_MODULES);
  const hasCaisse = canAccessModule(currentUser, 'CAISSE_DEPENSES', userModules, INITIAL_MODULES);
  const hasPrestations = canAccessModule(currentUser, 'PRESTATIONS', userModules, INITIAL_MODULES);
  const hasCommerciaux = canAccessModule(currentUser, 'COMMERCIAUX', userModules, INITIAL_MODULES);
  const hasCommissions = canAccessModule(currentUser, 'COMMISSIONS', userModules, INITIAL_MODULES);
  const isAdmin = currentUser.role === 'ADMIN';

  // Toggle module pour l'admin
  const handleToggleModule = (userId: string, moduleId: string, val: boolean) => {
    setUserModules(prev => {
      const idx = prev.findIndex(um => um.user_id === userId && um.module_id === moduleId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], is_enabled: val };
        return updated;
      }
      return [...prev, { id: `um-${Date.now()}`, user_id: userId, module_id: moduleId, is_enabled: val }];
    });
  };

  const cashBalance = calculateCashBalance(INITIAL_MOUVEMENTS);
  const stockValuation = calculateStockValuation(INITIAL_ARTICLES);
  const maintenanceStats = calculateMaintenanceStats(INITIAL_INTERVENTIONS);
  const thirdPartyStats = calculateThirdPartyStats(INITIAL_CLIENTS_FOURNISSEURS, [], INITIAL_MOUVEMENTS, INITIAL_INTERVENTIONS, INITIAL_ARTICLES);
  const commissionsStats = calculateCommissionsStats(INITIAL_COMMISSIONS);
  const commercialsStats = calculateCommercialsStats(INITIAL_AGENTS_COMMERCIAUX, INITIAL_PRESTATIONS, INITIAL_COMMISSIONS);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e88e5" />
      
      {/* Header Mobile */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hinov ERP</Text>
          <Text style={styles.headerSubtitle}>{currentUser.nom} ({currentUser.role})</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userSwitcher}>
          {profiles.map(u => (
            <TouchableOpacity 
              key={u.id} 
              onPress={() => setCurrentUser(u)} 
              style={[styles.userChip, currentUser.id === u.id && styles.userChipActive]}
            >
              <Text style={[styles.userChipText, currentUser.id === u.id && styles.userChipTextActive]}>
                {u.role === 'ADMIN' ? '👑 ' : ''}{u.nom.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Navigation Onglets */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBarScroll}>
        <View style={styles.tabBar}>
          <TouchableOpacity onPress={() => setActiveTab('DASHBOARD')} style={[styles.tabItem, activeTab === 'DASHBOARD' && styles.tabItemActive]}>
            <Text style={[styles.tabItemText, activeTab === 'DASHBOARD' && styles.tabItemTextActive]}>Accueil</Text>
          </TouchableOpacity>
          {hasTiers && (
            <TouchableOpacity onPress={() => setActiveTab('TIERS')} style={[styles.tabItem, activeTab === 'TIERS' && styles.tabItemActive]}>
              <Text style={[styles.tabItemText, activeTab === 'TIERS' && styles.tabItemTextActive]}>Tiers</Text>
            </TouchableOpacity>
          )}
          {hasCommerciaux && (
            <TouchableOpacity onPress={() => setActiveTab('COMMERCIAUX')} style={[styles.tabItem, activeTab === 'COMMERCIAUX' && styles.tabItemActive]}>
              <Text style={[styles.tabItemText, activeTab === 'COMMERCIAUX' && styles.tabItemTextActive]}>Commerciaux</Text>
            </TouchableOpacity>
          )}
          {hasCommissions && (
            <TouchableOpacity onPress={() => setActiveTab('COMMISSIONS')} style={[styles.tabItem, activeTab === 'COMMISSIONS' && styles.tabItemActive]}>
              <Text style={[styles.tabItemText, activeTab === 'COMMISSIONS' && styles.tabItemTextActive]}>Commissions</Text>
            </TouchableOpacity>
          )}
          {hasMaintenance && (
            <TouchableOpacity onPress={() => setActiveTab('MAINTENANCE')} style={[styles.tabItem, activeTab === 'MAINTENANCE' && styles.tabItemActive]}>
              <Text style={[styles.tabItemText, activeTab === 'MAINTENANCE' && styles.tabItemTextActive]}>Maintenance</Text>
            </TouchableOpacity>
          )}
          {hasStocks && (
            <TouchableOpacity onPress={() => setActiveTab('STOCKS')} style={[styles.tabItem, activeTab === 'STOCKS' && styles.tabItemActive]}>
              <Text style={[styles.tabItemText, activeTab === 'STOCKS' && styles.tabItemTextActive]}>Stocks</Text>
            </TouchableOpacity>
          )}
          {hasCaisse && (
            <TouchableOpacity onPress={() => setActiveTab('CAISSE')} style={[styles.tabItem, activeTab === 'CAISSE' && styles.tabItemActive]}>
              <Text style={[styles.tabItemText, activeTab === 'CAISSE' && styles.tabItemTextActive]}>Caisse</Text>
            </TouchableOpacity>
          )}
          {isAdmin && (
            <TouchableOpacity onPress={() => setActiveTab('ADMIN')} style={[styles.tabItem, activeTab === 'ADMIN' && styles.tabItemActive]}>
              <Text style={[styles.tabItemText, activeTab === 'ADMIN' && styles.tabItemTextActive]}>Toggles</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Contenu de la vue active */}
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'DASHBOARD' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📊 Synthèse Générale ERP</Text>
              <Text style={styles.cardSubtitle}>Modules autorisés pour votre session :</Text>
              <View style={styles.moduleBadgesContainer}>
                {hasTiers && <View style={[styles.badge, { backgroundColor: '#eff6ff' }]}><Text style={[styles.badgeText, { color: '#1e40af' }]}>👥 Tiers ({thirdPartyStats.totalTiers})</Text></View>}
                {hasCommerciaux && <View style={[styles.badge, { backgroundColor: '#eef2ff' }]}><Text style={[styles.badgeText, { color: '#4338ca' }]}>💼 Commerciaux ({commercialsStats.agentsCount})</Text></View>}
                {hasCommissions && <View style={[styles.badge, { backgroundColor: '#fdf2f8' }]}><Text style={[styles.badgeText, { color: '#be185d' }]}>💵 Commissions ({formatCurrency(commissionsStats.totalRestantADecaisser)})</Text></View>}
                {hasMaintenance && <View style={[styles.badge, { backgroundColor: '#e0f2fe' }]}><Text style={[styles.badgeText, { color: '#0369a1' }]}>🔧 Maintenance ({maintenanceStats.enAttente + maintenanceStats.enCours})</Text></View>}
                {hasStocks && <View style={[styles.badge, { backgroundColor: '#ede9fe' }]}><Text style={[styles.badgeText, { color: '#6d28d9' }]}>📦 Stocks ({stockValuation.nombreArticles})</Text></View>}
                {hasCaisse && <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}><Text style={[styles.badgeText, { color: '#15803d' }]}>💰 Caisse ({formatCurrency(cashBalance)})</Text></View>}
              </View>
            </View>

            {hasCommissions && (
              <View style={[styles.card, { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8' }]}>
                <Text style={[styles.cardTitle, { color: '#9d174d' }]}>💵 Commissions en Attente de Paiement</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#be185d', marginTop: 4 }}>
                  {formatCurrency(commissionsStats.totalRestantADecaisser)}
                </Text>
              </View>
            )}

            {hasTiers && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>👥 Top Clients & Partenaires</Text>
                {INITIAL_CLIENTS_FOURNISSEURS.slice(0, 3).map(t => (
                  <View key={t.id} style={styles.rowItem}>
                    <View>
                      <Text style={styles.rowPrimary}>[{t.type}] {t.nom}</Text>
                      <Text style={styles.rowSecondary}>{t.telephone || t.ville}</Text>
                    </View>
                    <View style={[styles.statusChip, { backgroundColor: t.type === 'CLIENT' ? '#eff6ff' : '#fffbeb' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: t.type === 'CLIENT' ? '#1e40af' : '#92400e' }}>
                        {t.type}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {hasMaintenance && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🔧 Interventions Récentes</Text>
                {INITIAL_INTERVENTIONS.map(i => (
                  <View key={i.id} style={styles.rowItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowPrimary}>{i.equipement}</Text>
                      <Text style={styles.rowSecondary}>{i.client_nom ? `${i.client_nom} • ` : ''}{i.site_agence}</Text>
                    </View>
                    <View style={[styles.statusChip, { backgroundColor: i.statut === 'TERMINEE' ? '#dcfce7' : '#fef3c7' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: i.statut === 'TERMINEE' ? '#15803d' : '#b45309' }}>
                        {i.statut}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Vue Tiers Mobile */}
        {activeTab === 'TIERS' && hasTiers && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>👥 Répertoire Clients & Fournisseurs</Text>
              <Text style={styles.cardSubtitle}>{thirdPartyStats.clientsCount} Clients • {thirdPartyStats.fournisseursCount} Fournisseurs</Text>
            </View>

            {INITIAL_CLIENTS_FOURNISSEURS.map(t => (
              <View key={t.id} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={[styles.rowPrimary, { fontSize: 16 }]}>{t.nom}</Text>
                  <View style={[styles.statusChip, { backgroundColor: t.type === 'CLIENT' ? '#eff6ff' : '#fffbeb' }]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: t.type === 'CLIENT' ? '#1e40af' : '#92400e' }}>
                      {t.type}
                    </Text>
                  </View>
                </View>
                <Text style={styles.rowSecondary}>📞 {t.telephone || 'Non renseigné'}</Text>
                <Text style={styles.rowSecondary}>✉️ {t.email || 'Non renseigné'}</Text>
                <Text style={styles.rowSecondary}>📍 {t.adresse}, {t.ville}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Vue Commerciaux Mobile */}
        {activeTab === 'COMMERCIAUX' && hasCommerciaux && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💼 Agents Commerciaux & Apporteurs</Text>
              <Text style={styles.cardSubtitle}>{commercialsStats.agentsCount} Agents • {commercialsStats.agentsActifsCount} Actifs</Text>
            </View>

            {INITIAL_AGENTS_COMMERCIAUX.map(agent => (
              <View key={agent.id} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={[styles.rowPrimary, { fontSize: 16 }]}>{agent.nom} {agent.prenom || ''}</Text>
                  <View style={[styles.statusChip, { backgroundColor: agent.actif ? '#dcfce7' : '#fee2e2' }]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: agent.actif ? '#15803d' : '#dc2626' }}>
                      {agent.actif ? 'ACTIF' : 'INACTIF'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.rowSecondary}>🏷️ Matricule: {agent.matricule || agent.id} • Taux standard: {agent.taux_commission_defaut || 0}%</Text>
                <Text style={styles.rowSecondary}>📞 {agent.telephone || 'Non renseigné'}</Text>
                <Text style={styles.rowSecondary}>✉️ {agent.email || 'Non renseigné'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Vue Commissions Mobile */}
        {activeTab === 'COMMISSIONS' && hasCommissions && (
          <View>
            <View style={[styles.card, { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8' }]}>
              <Text style={[styles.cardTitle, { color: '#9d174d' }]}>💵 État des Commissions</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#be185d', marginTop: 4 }}>
                {formatCurrency(commissionsStats.totalRestantADecaisser)} en attente
              </Text>
              <Text style={styles.cardSubtitle}>
                Payées : {formatCurrency(commissionsStats.totalPayees)}
              </Text>
            </View>

            {INITIAL_COMMISSIONS.map(comm => (
              <View key={comm.id} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={[styles.rowPrimary, { fontSize: 15 }]}>{comm.beneficiaire_nom}</Text>
                  <Text style={{ fontWeight: '800', color: comm.statut !== 'PAYEE' ? '#d97706' : '#16a34a' }}>
                    {formatCurrency(comm.montant_commission)}
                  </Text>
                </View>
                <Text style={styles.rowSecondary}>Type : {comm.type === 'APPORTEUR' ? "Apporteur d'affaires (10%)" : comm.type === 'RESPONSABLE' ? "Responsable de Service" : "Agent Commercial"}</Text>
                <Text style={styles.rowSecondary}>Réf Prestation : {comm.prestation_ref || '-'}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>Date : {comm.created_at ? new Date(comm.created_at).toLocaleDateString('fr-FR') : '-'}</Text>
                  <View style={[styles.statusChip, { backgroundColor: comm.statut === 'PAYEE' ? '#dcfce7' : '#fef3c7' }]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: comm.statut === 'PAYEE' ? '#15803d' : '#b45309' }}>
                      {comm.statut}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Vue Maintenance Mobile */}
        {activeTab === 'MAINTENANCE' && hasMaintenance && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔧 Pannes & Interventions</Text>
              <Text style={styles.cardSubtitle}>Total : {maintenanceStats.total} • En attente : {maintenanceStats.enAttente}</Text>
            </View>
            {INITIAL_INTERVENTIONS.map(i => (
              <View key={i.id} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={[styles.rowPrimary, { fontSize: 15 }]}>{i.equipement}</Text>
                  <Text style={{ fontWeight: '700', color: '#1e88e5' }}>{formatCurrency(i.prix)}</Text>
                </View>
                {i.client_nom && <Text style={{ color: '#1e40af', fontWeight: '700', fontSize: 12, marginBottom: 2 }}>🏢 {i.client_nom}</Text>}
                <Text style={styles.rowSecondary}>Site : {i.site_agence}</Text>
                <Text style={[styles.rowSecondary, { color: '#dc2626', marginTop: 2 }]}>Panne : {i.observation}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>Tech : {i.technicien_assigne || 'Non assigné'}</Text>
                  <View style={[styles.statusChip, { backgroundColor: i.statut === 'TERMINEE' ? '#dcfce7' : '#fef3c7' }]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: i.statut === 'TERMINEE' ? '#15803d' : '#b45309' }}>
                      {i.statut}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Vue Stocks Mobile */}
        {activeTab === 'STOCKS' && hasStocks && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📦 Stocks & Approvisionnement</Text>
              <Text style={styles.cardSubtitle}>Valeur achat : {formatCurrency(stockValuation.valeurAchatTotale)}</Text>
            </View>
            {INITIAL_ARTICLES.map(art => (
              <View key={art.id} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={[styles.rowPrimary, { fontSize: 15 }]}>{art.designation}</Text>
                  <Text style={{ fontWeight: '700', color: '#16a34a' }}>{formatCurrency(art.prix_unitaire_vente)}</Text>
                </View>
                {art.fournisseur_nom && <Text style={{ color: '#d97706', fontWeight: '600', fontSize: 12, marginBottom: 2 }}>🏪 Fournisseur : {art.fournisseur_nom}</Text>}
                <Text style={styles.rowSecondary}>Code : {art.code_article} • Cat : {art.type_article}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700' }}>Stock : {art.quantite_stock} {art.unite}</Text>
                  {art.quantite_stock <= art.seuil_alerte && (
                    <View style={[styles.statusChip, { backgroundColor: '#fee2e2' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#dc2626' }}>Alerte Réappro</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Vue Caisse Mobile */}
        {activeTab === 'CAISSE' && hasCaisse && (
          <View>
            <View style={[styles.card, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
              <Text style={[styles.cardTitle, { color: '#1e40af' }]}>💰 Solde Live de Caisse</Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#1e3a8a', marginTop: 4 }}>{formatCurrency(cashBalance)}</Text>
            </View>
            {INITIAL_MOUVEMENTS.map(m => (
              <View key={m.id} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={[styles.rowPrimary, { fontSize: 15 }]}>{m.motif}</Text>
                  <Text style={{ fontWeight: '800', color: m.type === 'ENTREE' ? '#16a34a' : '#dc2626' }}>
                    {m.type === 'ENTREE' ? '+ ' : '- '}{formatCurrency(m.montant)}
                  </Text>
                </View>
                {m.tier_nom && <Text style={{ color: '#1e293b', fontWeight: '600', fontSize: 12, marginBottom: 2 }}>Tiers : {m.tier_nom}</Text>}
                <Text style={styles.rowSecondary}>{new Date(m.date).toLocaleDateString('fr-FR')} • {m.mode_reglement}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Vue Toggles Admin */}
        {activeTab === 'ADMIN' && isAdmin && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>⚙️ Matrice des Permissions (Toggles)</Text>
              <Text style={styles.cardSubtitle}>Activez / désactivez les modules par utilisateur en temps réel :</Text>
            </View>

            {profiles.map(user => (
              <View key={user.id} style={styles.card}>
                <Text style={[styles.rowPrimary, { fontSize: 16, marginBottom: 8 }]}>
                  {user.role === 'ADMIN' ? '👑 ' : '👤 '}{user.nom} ({user.role})
                </Text>
                {INITIAL_MODULES.map(mod => {
                  const um = userModules.find(item => item.user_id === user.id && item.module_id === mod.id);
                  const isEnabled = user.role === 'ADMIN' ? true : (um ? um.is_enabled : false);

                  return (
                    <View key={mod.id} style={styles.toggleRow}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.toggleLabel}>{mod.nom}</Text>
                        <Text style={styles.toggleSubLabel}>{mod.code_module}</Text>
                      </View>
                      <Switch
                        value={isEnabled}
                        disabled={user.role === 'ADMIN'}
                        onValueChange={(val) => handleToggleModule(user.id, mod.id, val)}
                        trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
                        thumbColor={isEnabled ? '#1e88e5' : '#94a3b8'}
                      />
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e88e5',
    padding: 16,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#e0f2fe',
    marginTop: 2,
    fontWeight: '600',
  },
  userSwitcher: {
    marginTop: 12,
    flexDirection: 'row',
  },
  userChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
  },
  userChipActive: {
    backgroundColor: '#ffffff',
  },
  userChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  userChipTextActive: {
    color: '#1e88e5',
  },
  tabBarScroll: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#1e88e5',
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabItemTextActive: {
    color: '#1e88e5',
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
  },
  moduleBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowPrimary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  rowSecondary: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  toggleSubLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
