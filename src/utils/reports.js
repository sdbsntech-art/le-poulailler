import { parseISO, format, getYear, getMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export const MOIS_LABELS = MOIS;

function aggregateVentesDeces(lots) {
  const ventes = [];
  const deces = [];

  for (const lot of lots) {
    for (const v of lot.ventes || []) {
      ventes.push({ date: v.date, quantite: v.quantite || 0, lotId: lot.id, libelle: lot.libelle });
    }
    for (const d of lot.deces || []) {
      deces.push({ date: d.date, quantite: d.quantite || 0, lotId: lot.id, libelle: lot.libelle });
    }
  }
  return { ventes, deces };
}

export function computeRapportMensuel(lots, year, month) {
  const { ventes, deces } = aggregateVentesDeces(lots);
  const ventesMois = ventes.filter((v) => {
    const d = parseISO(v.date);
    return getYear(d) === year && getMonth(d) === month;
  });
  const decesMois = deces.filter((d) => {
    const dt = parseISO(d.date);
    return getYear(dt) === year && getMonth(dt) === month;
  });

  const poussinsVendus = ventesMois.reduce((s, v) => s + v.quantite, 0);
  const poussinsDecedes = decesMois.reduce((s, d) => s + d.quantite, 0);
  const lotsActifs = lots.filter((l) => l.quantiteInitiale > 0).length;

  return {
    periode: `${MOIS[month]} ${year}`,
    year,
    month,
    poussinsVendus,
    poussinsDecedes,
    nombreVentes: ventesMois.length,
    nombreDeces: decesMois.length,
    lotsEnregistres: lots.length,
    lotsActifs,
    ventes: ventesMois,
    deces: decesMois,
  };
}

export function computeRapportAnnuel(lots, year) {
  const { ventes, deces } = aggregateVentesDeces(lots);
  const ventesAnnee = ventes.filter((v) => getYear(parseISO(v.date)) === year);
  const decesAnnee = deces.filter((d) => getYear(parseISO(d.date)) === year);

  const parMois = MOIS.map((nom, month) => {
    const v = ventesAnnee.filter((x) => getMonth(parseISO(x.date)) === month);
    const d = decesAnnee.filter((x) => getMonth(parseISO(x.date)) === month);
    return {
      mois: nom,
      month,
      vendus: v.reduce((s, x) => s + x.quantite, 0),
      decedes: d.reduce((s, x) => s + x.quantite, 0),
    };
  });

  return {
    periode: `Année ${year}`,
    year,
    poussinsVendus: ventesAnnee.reduce((s, v) => s + v.quantite, 0),
    poussinsDecedes: decesAnnee.reduce((s, d) => s + d.quantite, 0),
    nombreVentes: ventesAnnee.length,
    lotsEnregistres: lots.length,
    parMois,
  };
}

export function getAnneesDisponibles(lots) {
  const years = new Set([new Date().getFullYear()]);
  const { ventes, deces } = aggregateVentesDeces(lots);
  [...ventes, ...deces].forEach((e) => years.add(getYear(parseISO(e.date))));
  lots.forEach((l) => {
    if (l.dateAchat) years.add(getYear(parseISO(l.dateAchat)));
  });
  return [...years].sort((a, b) => b - a);
}

export function formatPeriodeLabel(year, month) {
  return format(new Date(year, month, 1), 'MMMM yyyy', { locale: fr });
}
