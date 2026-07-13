import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

function calculateLotFinance(lot) {
  const eco = lot.economie || {};
  
  const quantiteInitiale = lot.quantiteInitiale || 0;
  const decesTotal = (lot.deces || []).reduce((s, d) => s + d.quantite, 0);
  const ventesTotal = (lot.ventes || []).reduce((s, v) => s + v.quantite, 0);
  
  // Chicks cost
  const chickUnitPrice = Number(eco.chickUnitPrice ?? 0);
  const chickBoxPrice = Number(eco.chickBoxPrice ?? 0);
  const isBox = eco.chickPriceType === 'box';
  const costChicks = isBox ? chickBoxPrice : (chickUnitPrice * quantiteInitiale);
  
  // Feed cost
  const feedBagPrice = Number(eco.feedBagPrice ?? 0);
  const feedBagsCount = Number(eco.feedBagsCount ?? 0);
  const costFeed = feedBagPrice * feedBagsCount;
  
  // Equipment & meds & other
  const costFeeders = Number(eco.feederPrice ?? 0);
  const costDrinkers = Number(eco.drinkerPrice ?? 0);
  const costMedication = Number(eco.medicationPrice ?? 0);
  const costOther = Number(eco.otherPrice ?? 0);
  
  // Total investment
  const totalInvestment = costChicks + costFeed + costFeeders + costDrinkers + costMedication + costOther;
  
  // Revenues from sales
  const totalRevenue = (lot.ventes || []).reduce((s, v) => s + (v.quantite * (v.prixUnitaire || 0)), 0);
  
  // Net gain & ROI
  const netGain = totalRevenue - totalInvestment;
  const roi = totalInvestment > 0 ? (netGain / totalInvestment) * 100 : 0;
  
  // Losses: number of dead chickens * purchase chick unit price
  const singleChickCost = quantiteInitiale > 0 ? (costChicks / quantiteInitiale) : 0;
  const totalLosses = decesTotal * singleChickCost;
  
  return {
    costChicks,
    costFeed,
    costFeeders,
    costDrinkers,
    costMedication,
    costOther,
    totalInvestment,
    totalRevenue,
    netGain,
    roi,
    decesTotal,
    ventesTotal,
    totalLosses,
    singleChickCost
  };
}

export default function EconomiePanel({ lots, modifierLot }) {
  const [editingLotId, setEditingLotId] = useState(null);

  // Form states for the lot currently being edited
  const [chickPriceType, setChickPriceType] = useState('unit');
  const [chickUnitPrice, setChickUnitPrice] = useState('');
  const [chickBoxPrice, setChickBoxPrice] = useState('');
  const [feedBagPrice, setFeedBagPrice] = useState('');
  const [feedBagsCount, setFeedBagsCount] = useState('');
  const [feederPrice, setFeederPrice] = useState('');
  const [drinkerPrice, setDrinkerPrice] = useState('');
  const [medicationPrice, setMedicationPrice] = useState('');
  const [otherPrice, setOtherPrice] = useState('');

  // Find currently editing lot
  const editingLot = useMemo(() => {
    return lots.find(l => l.id === editingLotId);
  }, [lots, editingLotId]);

  // Compute stats for all lots combined
  const globalStats = useMemo(() => {
    let totalInvested = 0;
    let totalEarned = 0;
    let totalLosses = 0;
    let totalMortsCount = 0;
    let totalVendusCount = 0;

    lots.forEach(lot => {
      const fin = calculateLotFinance(lot);
      totalInvested += fin.totalInvestment;
      totalEarned += fin.totalRevenue;
      totalLosses += fin.totalLosses;
      totalMortsCount += fin.decesTotal;
      totalVendusCount += fin.ventesTotal;
    });

    const netGain = totalEarned - totalInvested;
    const roi = totalInvested > 0 ? (netGain / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalEarned,
      netGain,
      totalLosses,
      roi,
      totalMortsCount,
      totalVendusCount
    };
  }, [lots]);

  // Live calculation for the lot currently being edited in the form
  const liveLotFinance = useMemo(() => {
    if (!editingLot) return null;
    const mockLot = {
      ...editingLot,
      economie: {
        chickPriceType,
        chickUnitPrice: chickUnitPrice === '' ? 0 : Number(chickUnitPrice),
        chickBoxPrice: chickBoxPrice === '' ? 0 : Number(chickBoxPrice),
        feedBagPrice: feedBagPrice === '' ? 0 : Number(feedBagPrice),
        feedBagsCount: feedBagsCount === '' ? 0 : Number(feedBagsCount),
        feederPrice: feederPrice === '' ? 0 : Number(feederPrice),
        drinkerPrice: drinkerPrice === '' ? 0 : Number(drinkerPrice),
        medicationPrice: medicationPrice === '' ? 0 : Number(medicationPrice),
        otherPrice: otherPrice === '' ? 0 : Number(otherPrice)
      }
    };
    return calculateLotFinance(mockLot);
  }, [
    editingLot,
    chickPriceType,
    chickUnitPrice,
    chickBoxPrice,
    feedBagPrice,
    feedBagsCount,
    feederPrice,
    drinkerPrice,
    medicationPrice,
    otherPrice
  ]);

  function startEditing(lot) {
    const eco = lot.economie || {};
    setEditingLotId(lot.id);
    setChickPriceType(eco.chickPriceType || 'unit');
    setChickUnitPrice(eco.chickUnitPrice ?? '');
    setChickBoxPrice(eco.chickBoxPrice ?? '');
    setFeedBagPrice(eco.feedBagPrice ?? '');
    setFeedBagsCount(eco.feedBagsCount ?? '');
    setFeederPrice(eco.feederPrice ?? '');
    setDrinkerPrice(eco.drinkerPrice ?? '');
    setMedicationPrice(eco.medicationPrice ?? '');
    setOtherPrice(eco.otherPrice ?? '');
  }

  function handleSave(e) {
    e.preventDefault();
    if (!editingLotId) return;

    modifierLot(editingLotId, {
      economie: {
        chickPriceType,
        chickUnitPrice: chickUnitPrice === '' ? null : Number(chickUnitPrice),
        chickBoxPrice: chickBoxPrice === '' ? null : Number(chickBoxPrice),
        feedBagPrice: feedBagPrice === '' ? null : Number(feedBagPrice),
        feedBagsCount: feedBagsCount === '' ? null : Number(feedBagsCount),
        feederPrice: feederPrice === '' ? null : Number(feederPrice),
        drinkerPrice: drinkerPrice === '' ? null : Number(drinkerPrice),
        medicationPrice: medicationPrice === '' ? null : Number(medicationPrice),
        otherPrice: otherPrice === '' ? null : Number(otherPrice)
      }
    });

    setEditingLotId(null);
  }

  function formatPrice(val) {
    return `${Math.round(val).toLocaleString('fr-FR')} FCFA`;
  }

  return (
    <div className="economie-panel">
      {/* HEADER SECTION */}
      <div className="section-header-row" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>Gestion Financière & Économie</h2>
          <p className="section-subtitle" style={{ marginTop: '0.25rem' }}>
            Suivi des coûts d'investissement, revenus de vente, calcul de rentabilité et retour sur investissement (ROI).
          </p>
        </div>
      </div>

      {/* GLOBAL STATS CARDS */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card" style={{ '--accent': 'var(--gold)' }}>
          <div className="stat-card__value">{formatPrice(globalStats.totalInvested)}</div>
          <div className="stat-card__label">Total Investi (Dépenses)</div>
        </div>
        <div className="stat-card" style={{ '--accent': 'var(--success)' }}>
          <div className="stat-card__value">{formatPrice(globalStats.totalEarned)}</div>
          <div className="stat-card__label">Total Gagné (Ventes)</div>
        </div>
        <div 
          className="stat-card" 
          style={{ 
            '--accent': globalStats.netGain >= 0 ? 'var(--success)' : 'var(--danger)' 
          }}
        >
          <div className="stat-card__value" style={{ color: globalStats.netGain >= 0 ? '#82c99b' : '#c45c5c' }}>
            {globalStats.netGain >= 0 ? '+' : ''}{formatPrice(globalStats.netGain)}
          </div>
          <div className="stat-card__label">Bénéfice Net</div>
        </div>
        <div className="stat-card" style={{ '--accent': 'var(--danger)' }}>
          <div className="stat-card__value">{formatPrice(globalStats.totalLosses)}</div>
          <div className="stat-card__label">Pertes Économiques ({globalStats.totalMortsCount} morts)</div>
        </div>
        <div 
          className="stat-card" 
          style={{ 
            '--accent': globalStats.roi >= 0 ? 'var(--success)' : 'var(--danger)' 
          }}
        >
          <div className="stat-card__value" style={{ color: globalStats.roi >= 0 ? '#82c99b' : '#c45c5c' }}>
            {globalStats.roi >= 0 ? '+' : ''}{globalStats.roi.toFixed(1)} %
          </div>
          <div className="stat-card__label">Retour sur Investissement (ROI)</div>
        </div>
      </div>

      {/* IF EDITING A LOT'S FINANCIALS */}
      {editingLot ? (
        <div className="card" style={{ border: '1px solid var(--gold-muted)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold-light)' }}>
              Éditer les finances : {editingLot.libelle || `Lot du ${format(parseISO(editingLot.dateAchat), 'dd MMM yyyy', { locale: fr })}`}
            </h3>
            <button 
              type="button" 
              className="btn btn-ghost btn-sm" 
              onClick={() => setEditingLotId(null)}
              style={{ fontSize: '1.2rem', padding: '0.2rem 0.5rem' }}
            >
              ✕ Fermer
            </button>
          </div>

          <div className="economie-editor-layout">
            {/* Left Column: Input Form */}
            <form onSubmit={handleSave} className="economie-form">
              {/* CHIKS SECTION */}
              <fieldset style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <legend style={{ padding: '0 0.5rem', color: 'var(--gold-light)', fontWeight: 'bold', fontSize: '0.9rem' }}>🐣 Achat des poussins</legend>
                
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Mode de tarification</label>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="chickPriceType"
                        value="unit"
                        checked={chickPriceType === 'unit'}
                        onChange={() => setChickPriceType('unit')}
                      />
                      Par poussin individuel
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="chickPriceType"
                        value="box"
                        checked={chickPriceType === 'box'}
                        onChange={() => setChickPriceType('box')}
                      />
                      Prix global de la caisse
                    </label>
                  </div>
                </div>

                {chickPriceType === 'unit' ? (
                  <div className="form-group">
                    <label>Prix d'un poussin (FCFA)</label>
                    <input
                      type="number"
                      min="0"
                      value={chickUnitPrice}
                      onChange={(e) => setChickUnitPrice(e.target.value)}
                      placeholder="Ex: 600"
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Prix total de la caisse / lot de poussins (FCFA)</label>
                    <input
                      type="number"
                      min="0"
                      value={chickBoxPrice}
                      onChange={(e) => setChickBoxPrice(e.target.value)}
                      placeholder="Ex: 30000"
                    />
                  </div>
                )}
              </fieldset>

              {/* FEED SECTION */}
              <fieldset style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <legend style={{ padding: '0 0.5rem', color: 'var(--gold-light)', fontWeight: 'bold', fontSize: '0.9rem' }}>🌾 Alimentation</legend>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Prix d'un sac d'aliments (FCFA)</label>
                    <input
                      type="number"
                      min="0"
                      value={feedBagPrice}
                      onChange={(e) => setFeedBagPrice(e.target.value)}
                      placeholder="Ex: 19000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre de sacs consommés</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={feedBagsCount}
                      onChange={(e) => setFeedBagsCount(e.target.value)}
                      placeholder="Ex: 12"
                    />
                  </div>
                </div>
              </fieldset>

              {/* EQUIPMENT & HEALTH */}
              <fieldset style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <legend style={{ padding: '0 0.5rem', color: 'var(--gold-light)', fontWeight: 'bold', fontSize: '0.9rem' }}>🛠️ Matériel & Santé</legend>
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                  <div className="form-group">
                    <label>Mangeoires (FCFA)</label>
                    <input
                      type="number"
                      min="0"
                      value={feederPrice}
                      onChange={(e) => setFeederPrice(e.target.value)}
                      placeholder="Prix total"
                    />
                  </div>
                  <div className="form-group">
                    <label>Abreuvoirs (FCFA)</label>
                    <input
                      type="number"
                      min="0"
                      value={drinkerPrice}
                      onChange={(e) => setDrinkerPrice(e.target.value)}
                      placeholder="Prix total"
                    />
                  </div>
                  <div className="form-group">
                    <label>Médicaments / Soins (FCFA)</label>
                    <input
                      type="number"
                      min="0"
                      value={medicationPrice}
                      onChange={(e) => setMedicationPrice(e.target.value)}
                      placeholder="Vaccins, vitamines..."
                    />
                  </div>
                </div>
              </fieldset>

              {/* OTHERS */}
              <fieldset style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <legend style={{ padding: '0 0.5rem', color: 'var(--gold-light)', fontWeight: 'bold', fontSize: '0.9rem' }}>💸 Autres dépenses</legend>
                <div className="form-group">
                  <label>Autres frais (transport, litière, électricité...) (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    value={otherPrice}
                    onChange={(e) => setOtherPrice(e.target.value)}
                    placeholder="Ex: 5000"
                  />
                </div>
              </fieldset>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary">
                  Enregistrer les finances
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditingLotId(null)}>
                  Annuler
                </button>
              </div>
            </form>

            {/* Right Column: Live Calculator Preview */}
            <div className="economie-live-preview">
              <div className="card card--highlight" style={{ margin: 0, height: '100%' }}>
                <h4 style={{ color: 'var(--gold-light)', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  📊 Aperçu Financier en Direct
                </h4>
                {liveLotFinance && (
                  <div className="live-preview-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>🐣 Coût des Poussins ({editingLot.quantiteInitiale} têtes) :</span>
                      <strong>{formatPrice(liveLotFinance.costChicks)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>🌾 Coût des Aliments ({feedBagsCount || 0} sacs) :</span>
                      <strong>{formatPrice(liveLotFinance.costFeed)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>🛠️ Matériel (Mangeoires + Abreuvoirs) :</span>
                      <strong>{formatPrice(liveLotFinance.costFeeders + liveLotFinance.costDrinkers)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>🏥 Médicaments & Soins :</span>
                      <strong>{formatPrice(liveLotFinance.costMedication)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>💸 Autres frais :</span>
                      <strong>{formatPrice(liveLotFinance.costOther)}</strong>
                    </div>

                    <div style={{ borderTop: '2px dashed var(--border)', margin: '0.5rem 0' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>💰 Total Investissement :</span>
                      <span style={{ color: 'var(--gold-light)' }}>{formatPrice(liveLotFinance.totalInvestment)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>📈 Revenu des Ventes ({liveLotFinance.ventesTotal} vendus) :</span>
                      <strong style={{ color: 'var(--success)' }}>{formatPrice(liveLotFinance.totalRevenue)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>💀 Pertes estimées ({liveLotFinance.decesTotal} décédés) :</span>
                      <strong style={{ color: 'var(--danger)' }}>{formatPrice(liveLotFinance.totalLosses)}</strong>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      <span>🍀 Gain Net Estimé :</span>
                      <span style={{ color: liveLotFinance.netGain >= 0 ? '#82c99b' : '#c45c5c' }}>
                        {liveLotFinance.netGain >= 0 ? '+' : ''}{formatPrice(liveLotFinance.netGain)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>🚀 ROI du lot :</span>
                      <span style={{ color: liveLotFinance.roi >= 0 ? '#82c99b' : '#c45c5c' }}>
                        {liveLotFinance.roi >= 0 ? '+' : ''}{liveLotFinance.roi.toFixed(1)} %
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIST OF LOTS SECTION */
        <div className="card">
          <h3 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Synthèse par Lot</h3>
          {lots.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📈</div>
              <p>Aucun lot enregistré. Créez un lot sur le tableau de bord pour commencer le suivi financier.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="economie-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Lot / Achat</th>
                    <th style={{ padding: '0.75rem' }}>Investissement</th>
                    <th style={{ padding: '0.75rem' }}>Ventes (Gain)</th>
                    <th style={{ padding: '0.75rem' }}>Pertes (Morts)</th>
                    <th style={{ padding: '0.75rem' }}>Bénéfice Net</th>
                    <th style={{ padding: '0.75rem' }}>ROI</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot) => {
                    const fin = calculateLotFinance(lot);
                    const dateLabel = format(parseISO(lot.dateAchat), 'dd MMM yyyy', { locale: fr });
                    return (
                      <tr key={lot.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 'bold' }}>{lot.libelle || `Lot du ${dateLabel}`}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cream-muted)' }}>
                            {lot.quantiteInitiale} poussins · J{Math.max(0, Math.floor((Date.now() - new Date(lot.dateAchat)) / (1000 * 60 * 60 * 24)))}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div>{formatPrice(fin.totalInvestment)}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cream-muted)' }}>
                            Poussins: {formatPrice(fin.costChicks)} | Aliments: {formatPrice(fin.costFeed)}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ color: 'var(--success)' }}>{formatPrice(fin.totalRevenue)}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cream-muted)' }}>
                            {fin.ventesTotal} vendus
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--danger)' }}>
                          <div>{formatPrice(fin.totalLosses)}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cream-muted)' }}>
                            {fin.decesTotal} décédés
                          </div>
                        </td>
                        <td 
                          style={{ 
                            padding: '0.75rem', 
                            fontWeight: 'bold', 
                            color: fin.netGain >= 0 ? '#82c99b' : '#c45c5c' 
                          }}
                        >
                          {fin.netGain >= 0 ? '+' : ''}{formatPrice(fin.netGain)}
                        </td>
                        <td 
                          style={{ 
                            padding: '0.75rem', 
                            fontWeight: 'bold', 
                            color: fin.roi >= 0 ? '#82c99b' : '#c45c5c' 
                          }}
                        >
                          {fin.roi >= 0 ? '+' : ''}{fin.roi.toFixed(1)} %
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <button 
                            type="button" 
                            className="btn btn-primary btn-sm"
                            onClick={() => startEditing(lot)}
                          >
                            Modifier Coûts
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
