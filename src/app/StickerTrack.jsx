'use client';
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

const STORAGE_KEY = 'stickertrack_collection';
const SETTINGS_KEY = 'stickertrack_settings';

function loadCollection() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveCollection(data) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
function loadSettings() {
  if (typeof window === 'undefined') return { lang: 'es', theme: 'light' };
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{"lang":"es","theme":"light"}'); } catch { return { lang: 'es', theme: 'light' }; }
}
function saveSettings(data) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(data)); } catch {}
}

const LANGS = { es: "🇪🇸", en: "🇬🇧", fr: "🇫🇷", pt: "🇧🇷" };
const T = {
  es: {
    app: "StickerTrack", sub: "MUNDIAL 2026 · TRACKER",
    tabs: { col: "Colección", mkt: "Mercado", stats: "Stats", cfg: "Ajustes" },
    c: { have: "Tengo", need: "Faltan", dupes: "Repetidas", prog: "Progreso",
      fAll: "Todas", fHave: "Tengo", fNeed: "Faltan", fDupes: "Repetidas",
      help: "Toque: falta → tengo → +repetida · Mantener: resetear",
      qa: "Agregar rápido", qaPH: "Ej: MEX1, BRA5, ARG1-ARG20",
      qaBtn: "Agregar", qaHelp: "Prefijos reales · Comas para separar · Guión para rangos" },
    m: { title: "Mercado", offers: "Ofrece", needs: "Busca", contact: "Contactar",
      free: "Gratis hasta 5/mes", premium: "Premium: ilimitados", match: "Match" },
    s: { title: "Estadísticas", bySec: "Por grupo", comp: "Completado",
      rem: "Faltan", dup: "Repetidas", packs: "Sobres est.", cost: "Costo est." },
    cfg: { title: "Ajustes", theme: "Tema", dark: "Oscuro", light: "Claro",
      exp: "Exportar datos", imp: "Importar datos", reset: "Reiniciar", shareApp: "Descargar app" },
    promo: { sp: "Patrocinado", more: "Más" },
    prem: { title: "StickerTrack Premium", price: "$2.99/mes",
      feats: ["Intercambios ilimitados","Sin publicidad","Stats avanzadas","Exportar Excel","Soporte prioritario"],
      sub: "Suscribirse", close: "Cerrar" },
    sh: { title: "Compartir repetidas", img: "💾 Descargar imagen", txt: "📋 Copiar texto", copied: "¡Copiado!", none: "Aún no tienes repetidas" },
  },
  en: {
    app: "StickerTrack", sub: "WORLD CUP 2026 · TRACKER",
    tabs: { col: "Collection", mkt: "Market", stats: "Stats", cfg: "Settings" },
    c: { have: "Have", need: "Need", dupes: "Dupes", prog: "Progress",
      fAll: "All", fHave: "Have", fNeed: "Need", fDupes: "Dupes",
      help: "Tap: need → have → +dupe · Hold: reset",
      qa: "Quick Add", qaPH: "E.g.: MEX1, BRA5, ARG1-ARG20",
      qaBtn: "Add", qaHelp: "Real prefixes · Comma-separated · Dash for ranges" },
    m: { title: "Market", offers: "Offers", needs: "Needs", contact: "Contact",
      free: "Free up to 5/mo", premium: "Premium: unlimited", match: "Match" },
    s: { title: "Statistics", bySec: "By group", comp: "Completed",
      rem: "Remaining", dup: "Duplicates", packs: "Est. packs", cost: "Est. cost" },
    cfg: { title: "Settings", theme: "Theme", dark: "Dark", light: "Light",
      exp: "Export data", imp: "Import data", reset: "Reset", shareApp: "Download app" },
    promo: { sp: "Sponsored", more: "More" },
    prem: { title: "StickerTrack Premium", price: "$2.99/mo",
      feats: ["Unlimited trades","No ads","Advanced stats","Export Excel","Priority support"],
      sub: "Subscribe", close: "Close" },
    sh: { title: "Share dupes", img: "💾 Download image", txt: "📋 Copy text", copied: "Copied!", none: "No dupes yet" },
  },
  fr: {
    app: "StickerTrack", sub: "COUPE DU MONDE 2026 · TRACKER",
    tabs: { col: "Collection", mkt: "Marché", stats: "Stats", cfg: "Réglages" },
    c: { have: "J'ai", need: "Manquantes", dupes: "Doubles", prog: "Progrès",
      fAll: "Toutes", fHave: "J'ai", fNeed: "Manquantes", fDupes: "Doubles",
      help: "Toucher: manquante → j'ai → +double · Maintenir: réinit.",
      qa: "Ajout rapide", qaPH: "Ex: MEX1, BRA5, ARG1-ARG20",
      qaBtn: "Ajouter", qaHelp: "Préfixes réels · Virgules · Tiret pour plages" },
    m: { title: "Marché", offers: "Offre", needs: "Cherche", contact: "Contacter",
      free: "Gratuit 5/mois", premium: "Premium: illimités", match: "Match" },
    s: { title: "Statistiques", bySec: "Par groupe", comp: "Complété",
      rem: "Restant", dup: "Doubles", packs: "Pochettes est.", cost: "Coût est." },
    cfg: { title: "Réglages", theme: "Thème", dark: "Sombre", light: "Clair",
      exp: "Exporter", imp: "Importer", reset: "Réinit.", shareApp: "Télécharger l'app" },
    promo: { sp: "Sponsorisé", more: "Plus" },
    prem: { title: "StickerTrack Premium", price: "2,99€/mois",
      feats: ["Échanges illimités","Sans pub","Stats avancées","Export Excel","Support prioritaire"],
      sub: "S'abonner", close: "Fermer" },
    sh: { title: "Partager doubles", img: "💾 Télécharger image", txt: "📋 Copier texte", copied: "Copié !", none: "Pas encore de doubles" },
  },
  pt: {
    app: "StickerTrack", sub: "COPA 2026 · TRACKER",
    tabs: { col: "Coleção", mkt: "Mercado", stats: "Stats", cfg: "Config" },
    c: { have: "Tenho", need: "Faltam", dupes: "Repetidas", prog: "Progresso",
      fAll: "Todas", fHave: "Tenho", fNeed: "Faltam", fDupes: "Repetidas",
      help: "Toque: falta → tenho → +repetida · Segurar: voltar",
      qa: "Adicionar rápido", qaPH: "Ex: MEX1, BRA5, ARG1-ARG20",
      qaBtn: "Adicionar", qaHelp: "Prefixos reais · Vírgulas · Traço p/ intervalos" },
    m: { title: "Mercado", offers: "Oferece", needs: "Procura", contact: "Contatar",
      free: "Grátis 5/mês", premium: "Premium: ilimitadas", match: "Match" },
    s: { title: "Estatísticas", bySec: "Por grupo", comp: "Completo",
      rem: "Faltam", dup: "Repetidas", packs: "Pacotes est.", cost: "Custo est." },
    cfg: { title: "Config", theme: "Tema", dark: "Escuro", light: "Claro",
      exp: "Exportar", imp: "Importar", reset: "Resetar", shareApp: "Baixar app" },
    promo: { sp: "Patrocinado", more: "Mais" },
    prem: { title: "StickerTrack Premium", price: "R$14,90/mês",
      feats: ["Trocas ilimitadas","Sem anúncios","Stats avançadas","Exportar Excel","Suporte prioritário"],
      sub: "Assinar", close: "Fechar" },
    sh: { title: "Compartilhar repetidas", img: "💾 Baixar imagem", txt: "📋 Copiar texto", copied: "Copiado!", none: "Sem repetidas ainda" },
  },
};

const ALBUM = [
  { id:"FWC", name:"FIFA World Cup", flag:"🏆", codes:["00","FWC1","FWC2","FWC3","FWC4","FWC5","FWC6","FWC7","FWC8","FWC9","FWC10","FWC11","FWC12","FWC13","FWC14","FWC15","FWC16","FWC17","FWC18","FWC19"], color:"#C8A951", group:null },
  { id:"MEX", name:"México", flag:"🇲🇽", prefix:"MEX", count:20, color:"#C62828", group:"A" },
  { id:"RSA", name:"South Africa", flag:"🇿🇦", prefix:"RSA", count:20, color:"#C62828", group:"A" },
  { id:"KOR", name:"South Korea", flag:"🇰🇷", prefix:"KOR", count:20, color:"#C62828", group:"A" },
  { id:"CZE", name:"Czechia", flag:"🏳️‍", prefix:"CZE", count:20, color:"#C62828", group:"A" },
  { id:"CAN", name:"Canada", flag:"🇨🇦", prefix:"CAN", count:20, color:"#1565C0", group:"B" },
  { id:"BIH", name:"Bosnia & Herz.", flag:"🇧🇦", prefix:"BIH", count:20, color:"#1565C0", group:"B" },
  { id:"QAT", name:"Qatar", flag:"🇶🇦", prefix:"QAT", count:20, color:"#1565C0", group:"B" },
  { id:"SUI", name:"Switzerland", flag:"🇨🇭", prefix:"SUI", count:20, color:"#1565C0", group:"B" },
  { id:"BRA", name:"Brazil", flag:"🇧🇷", prefix:"BRA", count:20, color:"#2E7D32", group:"C" },
  { id:"MAR", name:"Morocco", flag:"🇲🇦", prefix:"MAR", count:20, color:"#2E7D32", group:"C" },
  { id:"HAI", name:"Haiti", flag:"🇭🇹", prefix:"HAI", count:20, color:"#2E7D32", group:"C" },
  { id:"SCO", name:"Scotland", flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", prefix:"SCO", count:20, color:"#2E7D32", group:"C" },
  { id:"USA", name:"USA", flag:"🇺🇸", prefix:"USA", count:20, color:"#B71C1C", group:"D" },
  { id:"PAR", name:"Paraguay", flag:"🇵🇾", prefix:"PAR", count:20, color:"#B71C1C", group:"D" },
  { id:"AUS", name:"Australia", flag:"🇦🇺", prefix:"AUS", count:20, color:"#B71C1C", group:"D" },
  { id:"TUR", name:"Türkiye", flag:"🇹🇷", prefix:"TUR", count:20, color:"#B71C1C", group:"D" },
  { id:"GER", name:"Germany", flag:"🇩🇪", prefix:"GER", count:20, color:"#E65100", group:"E" },
  { id:"CUW", name:"Curaçao", flag:"🇨🇼", prefix:"CUW", count:20, color:"#E65100", group:"E" },
  { id:"CIV", name:"Côte d'Ivoire", flag:"🇨🇮", prefix:"CIV", count:20, color:"#E65100", group:"E" },
  { id:"ECU", name:"Ecuador", flag:"🇪🇨", prefix:"ECU", count:20, color:"#E65100", group:"E" },
  { id:"NED", name:"Netherlands", flag:"🇳🇱", prefix:"NED", count:20, color:"#EF6C00", group:"F" },
  { id:"JPN", name:"Japan", flag:"🇯🇵", prefix:"JPN", count:20, color:"#EF6C00", group:"F" },
  { id:"SWE", name:"Sweden", flag:"🇸🇪", prefix:"SWE", count:20, color:"#EF6C00", group:"F" },
  { id:"TUN", name:"Tunisia", flag:"🇹🇳", prefix:"TUN", count:20, color:"#EF6C00", group:"F" },
  { id:"BEL", name:"Belgium", flag:"🇧🇪", prefix:"BEL", count:20, color:"#6A1B9A", group:"G" },
  { id:"EGY", name:"Egypt", flag:"🇪🇬", prefix:"EGY", count:20, color:"#6A1B9A", group:"G" },
  { id:"IRN", name:"Iran", flag:"🇮🇷", prefix:"IRN", count:20, color:"#6A1B9A", group:"G" },
  { id:"NZL", name:"New Zealand", flag:"🇳🇿", prefix:"NZL", count:20, color:"#6A1B9A", group:"G" },
  { id:"ESP", name:"Spain", flag:"🇪🇸", prefix:"ESP", count:20, color:"#AD1457", group:"H" },
  { id:"CPV", name:"Cabo Verde", flag:"🇨🇻", prefix:"CPV", count:20, color:"#AD1457", group:"H" },
  { id:"KSA", name:"Saudi Arabia", flag:"🇸🇦", prefix:"KSA", count:20, color:"#AD1457", group:"H" },
  { id:"URU", name:"Uruguay", flag:"🇺🇾", prefix:"URU", count:20, color:"#AD1457", group:"H" },
  { id:"FRA", name:"France", flag:"🇫🇷", prefix:"FRA", count:20, color:"#00838F", group:"I" },
  { id:"SEN", name:"Senegal", flag:"🇸🇳", prefix:"SEN", count:20, color:"#00838F", group:"I" },
  { id:"IRQ", name:"Iraq", flag:"🇮🇶", prefix:"IRQ", count:20, color:"#00838F", group:"I" },
  { id:"NOR", name:"Norway", flag:"🇳🇴", prefix:"NOR", count:20, color:"#00838F", group:"I" },
  { id:"ARG", name:"Argentina", flag:"🇦🇷", prefix:"ARG", count:20, color:"#4527A0", group:"J" },
  { id:"ALG", name:"Algeria", flag:"🇩🇿", prefix:"ALG", count:20, color:"#4527A0", group:"J" },
  { id:"AUT", name:"Austria", flag:"🇦🇹", prefix:"AUT", count:20, color:"#4527A0", group:"J" },
  { id:"JOR", name:"Jordan", flag:"🇯🇴", prefix:"JOR", count:20, color:"#4527A0", group:"J" },
  { id:"POR", name:"Portugal", flag:"🇵🇹", prefix:"POR", count:20, color:"#1B5E20", group:"K" },
  { id:"COD", name:"DR Congo", flag:"🇨🇩", prefix:"COD", count:20, color:"#1B5E20", group:"K" },
  { id:"UZB", name:"Uzbekistan", flag:"🇺🇿", prefix:"UZB", count:20, color:"#1B5E20", group:"K" },
  { id:"COL", name:"Colombia", flag:"🇨🇴", prefix:"COL", count:20, color:"#1B5E20", group:"K" },
  { id:"ENG", name:"England", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", prefix:"ENG", count:20, color:"#BF360C", group:"L" },
  { id:"CRO", name:"Croatia", flag:"🇭🇷", prefix:"CRO", count:20, color:"#BF360C", group:"L" },
  { id:"GHA", name:"Ghana", flag:"🇬🇭", prefix:"GHA", count:20, color:"#BF360C", group:"L" },
  { id:"PAN", name:"Panama", flag:"🇵🇦", prefix:"PAN", count:20, color:"#BF360C", group:"L" },
  { id:"CC", name:"Coca-Cola", flag:"🥤", prefix:"CC", count:12, color:"#E53935", group:null },
];

function getStickerCodes(section) {
  if (section.codes) return section.codes;
  return Array.from({ length: section.count }, (_, i) => `${section.prefix}${i + 1}`);
}

const ALL_CODES = ALBUM.flatMap(getStickerCodes);
const TOTAL = ALL_CODES.length; // 980

function Cell({ code, status, color, onTap, onReset, dk }) {
  const pressing = useRef(false);
  const tmr = useRef(null);
  const didL = useRef(false);
  const startY = useRef(0);
  const moved = useRef(false);
  const dn = (e) => { pressing.current = true; didL.current = false; moved.current = false; if (e.touches) startY.current = e.touches[0].clientY; tmr.current = setTimeout(() => { didL.current = true; onReset(code); pressing.current = false; }, 600); };
  const mv = (e) => { if (e.touches && Math.abs(e.touches[0].clientY - startY.current) > 8) { moved.current = true; if (tmr.current) clearTimeout(tmr.current); } };
  const up = () => { if (tmr.current) clearTimeout(tmr.current); if (pressing.current && !didL.current && !moved.current) onTap(code); pressing.current = false; };
  const lv = () => { if (tmr.current) clearTimeout(tmr.current); pressing.current = false; };
  const owned = status >= 1, dupe = status > 1;
  const short = code.replace(/[0-9]+$/, "");
  const num = code.replace(/^[A-Z]+/, "");
  const emptyBg = dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const emptyBorder = dk ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.16)";
  const emptyText = dk ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.32)";
  return (
    <div onMouseDown={dn} onMouseUp={up} onMouseLeave={lv}
      onTouchStart={dn} onTouchMove={mv} onTouchEnd={e => { e.preventDefault(); up(); }}
      style={{
        width: "100%", aspectRatio: "1/1", borderRadius: "50%",
        background: owned ? (dupe ? `linear-gradient(135deg,${color}50,${color}80)` : `${color}28`) : emptyBg,
        border: `1.5px solid ${owned ? (dupe ? color + "B0" : color + "60") : emptyBorder}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer", userSelect: "none", position: "relative",
        transition: "transform 0.1s, box-shadow 0.1s",
        boxShadow: dupe ? `0 2px 10px ${color}35` : owned ? `0 1px 4px ${color}18` : "none",
      }}>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, fontWeight: 500, color: owned ? color : emptyText, letterSpacing: 0.2, lineHeight: 1 }}>{short}</span>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 700, color: owned ? (dk ? "#fff" : "#111") : emptyText, lineHeight: 1.1 }}>{num}</span>
      {dupe && <div style={{ position: "absolute", top: -3, right: -3, background: "#E53935", borderRadius: 8, padding: "0 4px", fontSize: 9, fontWeight: 800, color: "#fff", fontFamily: "'DM Mono',monospace", lineHeight: "15px", minWidth: 15, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>×{status}</div>}
    </div>
  );
}

const MOCK_OFFERS = [
  { id: 1, user: "Carlos_EC", city: "Quito 🇪🇨", offers: ["MEX5","BRA14","ARG3","GER10","ESP7"], needs: ["ECU1","ECU15","COL8","USA16"], time: "2m" },
  { id: 2, user: "FutFan99", city: "CDMX 🇲🇽", offers: ["FWC3","MEX1","KOR18","JPN5","ENG12"], needs: ["MEX13","BRA20","ARG1","FRA14"], time: "15m" },
  { id: 3, user: "BrasilFig", city: "São Paulo 🇧🇷", offers: ["BRA2","BRA9","ARG20","COL3","POR5"], needs: ["BRA17","HAI1","SCO11","CRO7"], time: "1h" },
  { id: 4, user: "FutbolArg", city: "Buenos Aires 🇦🇷", offers: ["ARG1","ARG14","ESP3","FRA8","URU19"], needs: ["ARG7","ALG5","AUT12","JOR1"], time: "3h" },
];

export default function App() {
  const [lang, setLang] = useState("es");
  const [tab, setTab] = useState("col");
  const [stickers, setStickers] = useState({});
  const [filter, setFilter] = useState("all");
  const [activeSec, setActiveSec] = useState("FWC");
  const [qi, setQi] = useState("");
  const [showQA, setShowQA] = useState(false);
  const [showPrem, setShowPrem] = useState(false);
  const [theme, setTheme] = useState("light");
  const [loaded, setLoaded] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  useEffect(() => {
    const saved = loadCollection();
    const settings = loadSettings();
    setStickers(saved);
    setLang(settings.lang || "es");
    setTheme(settings.theme || "light");
    setLoaded(true);
  }, []);

  useEffect(() => { if (loaded) saveCollection(stickers); }, [stickers, loaded]);
  useEffect(() => { if (loaded) saveSettings({ lang, theme }); }, [lang, theme, loaded]);

  const t = T[lang];
  const A = "#C8A951";

  const tap = useCallback(c => setStickers(p => ({ ...p, [c]: (p[c] || 0) + 1 })), []);
  const reset = useCallback(c => setStickers(p => { const x = { ...p }; delete x[c]; return x; }), []);

  const quickAdd = useCallback(() => {
    if (!qi.trim()) return;
    const adds = new Set();
    qi.toUpperCase().split(",").forEach(part => {
      const tr = part.trim();
      if (tr.includes("-")) {
        const [a, b] = tr.split("-").map(s => s.trim());
        const prefA = a.replace(/[0-9]+$/, ""), numA = parseInt(a.replace(/^[A-Z]+/, ""));
        const numB = parseInt(b.replace(/^[A-Z]+/, ""));
        if (prefA && !isNaN(numA) && !isNaN(numB)) {
          for (let i = Math.min(numA, numB); i <= Math.max(numA, numB); i++) {
            const code = `${prefA}${i}`;
            if (ALL_CODES.includes(code)) adds.add(code);
          }
        }
      } else {
        if (ALL_CODES.includes(tr)) adds.add(tr);
        else if (tr === "00") adds.add("00");
      }
    });
    setStickers(p => { const x = { ...p }; adds.forEach(c => { x[c] = (x[c] || 0) + 1; }); return x; });
    setQi("");
  }, [qi]);

  const stats = useMemo(() => {
    let h = 0, d = 0;
    Object.values(stickers).forEach(v => { if (v >= 1) h++; if (v > 1) d += v - 1; });
    return { have: h, need: TOTAL - h, dupes: d, total: TOTAL };
  }, [stickers]);

  const secStats = useMemo(() =>
    ALBUM.map(sec => {
      const codes = getStickerCodes(sec);
      const have = codes.filter(c => stickers[c] >= 1).length;
      return { ...sec, have, total: codes.length, pct: Math.round((have / codes.length) * 100) };
    }), [stickers]);

  const sec = ALBUM.find(s => s.id === activeSec) || ALBUM[0];
  const secCodes = getStickerCodes(sec);
  const filtered = secCodes.filter(c => {
    const s = stickers[c] || 0;
    if (filter === "have") return s >= 1;
    if (filter === "need") return s === 0;
    if (filter === "dupes") return s > 1;
    return true;
  });

  const myDupes = useMemo(() => Object.entries(stickers).filter(([, v]) => v > 1).map(([k]) => k), [stickers]);
  const myNeeds = useMemo(() => ALL_CODES.filter(c => !stickers[c]), [stickers]);
  const matched = useMemo(() => MOCK_OFFERS.map(o => ({
    ...o, ms: o.offers.filter(n => myNeeds.includes(n)).length + o.needs.filter(n => myDupes.includes(n)).length,
  })).sort((a, b) => b.ms - a.ms), [myDupes, myNeeds]);

  const generateShareImage = useCallback(() => {
    const AC = '#C8A951';
    const isDark = theme === 'dark';
    const dupsByTeam = ALBUM.map(sec => {
      const codes = getStickerCodes(sec);
      const dupes = codes.filter(c => (stickers[c]||0) > 1).map(c => c);
      return dupes.length > 0 ? { ...sec, dupes } : null;
    }).filter(Boolean);
    if (!dupsByTeam.length) return;

    const W = 800, PAD = 40, INNER = W - PAD * 2;
    const CW = 70, CH = 26, CG = 6;
    const CPR = Math.floor(INNER / (CW + CG));
    const VP = 14, TH = 28, GAP = 8;
    const teams = dupsByTeam.map(t => {
      const rows = Math.ceil(t.dupes.length / CPR);
      return { ...t, h: VP + TH + rows * (CH + CG) + VP };
    });
    const HEADER = 110, FOOTER = 56;
    const totalH = HEADER + teams.reduce((s, t) => s + t.h + GAP, 0) + PAD + FOOTER;

    const canvas = document.createElement('canvas');
    canvas.width = W * 2; canvas.height = totalH * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    const bgC = isDark ? '#0A0A12' : '#F2EFE7';
    const tSC = isDark ? '#6A6A7A' : '#888';
    const cBgC = isDark ? '#16161F' : '#FFFFFF';
    const brdC = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)';

    const rr = (x, y, w, h, r, fill, stroke) => {
      ctx.beginPath();
      if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); }
      else { ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath(); }
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    };

    document.fonts.ready.then(() => {
      ctx.fillStyle = bgC; ctx.fillRect(0, 0, W, totalH);

      ctx.font = '900 28px "Playfair Display", Georgia, serif';
      ctx.fillStyle = AC;
      ctx.fillText('⚽ StickerTrack', PAD, 40);

      const subs = { es:'MIS REPETIDAS PARA INTERCAMBIO', en:'MY DUPES FOR TRADING', fr:'MES DOUBLES POUR L\'ÉCHANGE', pt:'MINHAS REPETIDAS PARA TROCA' };
      ctx.font = '500 11px "DM Mono", monospace';
      ctx.fillStyle = tSC;
      ctx.fillText(subs[lang] || subs.es, PAD, 58);

      ctx.strokeStyle = AC + '30'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD, 72); ctx.lineTo(W-PAD, 72); ctx.stroke();

      let y = 88;
      teams.forEach(team => {
        rr(PAD, y, INNER, team.h, 10, cBgC, brdC);
        let ty = y + VP;
        ctx.font = '700 13px "DM Mono", monospace';
        ctx.fillStyle = team.color;
        ctx.textAlign = 'left';
        ctx.fillText(`${team.flag} ${team.name}`, PAD + 14, ty + 14);
        ty += TH;
        team.dupes.forEach((label, i) => {
          const col = i % CPR, row = Math.floor(i / CPR);
          const cx = PAD + 14 + col * (CW + CG);
          const cy = ty + row * (CH + CG);
          rr(cx, cy, CW, CH, 5, team.color + '20', team.color + '55');
          ctx.font = '700 11px "DM Mono", monospace';
          ctx.fillStyle = team.color;
          ctx.textAlign = 'center';
          ctx.fillText(label, cx + CW/2, cy + CH/2 + 4);
        });
        y += team.h + GAP;
      });

      y += 18;
      ctx.font = '400 10px "DM Mono", monospace';
      ctx.fillStyle = tSC;
      ctx.textAlign = 'center';
      ctx.fillText(`stickertrack.app · Mundial 2026 · ${new Date().toLocaleDateString()}`, W/2, y);

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'mis-repetidas.png'; a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    });
  }, [stickers, lang, theme]);

  const copyDupesText = useCallback(() => {
    const subs = { es:'Mis repetidas para intercambio', en:'My dupes for trading', fr:'Mes doubles', pt:'Minhas repetidas' };
    const lines = ['⚽ StickerTrack — ' + (subs[lang]||subs.es), ''];
    ALBUM.forEach(sec => {
      const codes = getStickerCodes(sec);
      const dupes = codes.filter(c => (stickers[c]||0) > 1).map(c => `${c}×${stickers[c]}`);
      if (dupes.length) lines.push(`${sec.flag} ${sec.name}: ${dupes.join(', ')}`);
    });
    lines.push('', 'stickertrack.app');
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2500);
    });
  }, [stickers, lang]);

  const dk = theme === "dark";
  const bg       = dk ? "#0A0A12" : "#F2EFE7";
  const cardBg   = dk ? "rgba(255,255,255,0.045)" : "#FFFFFF";
  const cardSh   = dk ? "none" : "0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)";
  const inputBg  = dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const tP       = dk ? "#E8E4DA" : "#1C1C1E";
  const tS       = dk ? "#6A6A7A" : "#666";
  const brd      = dk ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";

  const groups = useMemo(() => {
    const g = {}, sp = [];
    ALBUM.forEach(s => { if (s.group) { if (!g[s.group]) g[s.group] = { color: s.color, secs: [] }; g[s.group].secs.push(s); } else sp.push(s); });
    return { groups: g, special: sp };
  }, []);

  const card = (extra = {}) => ({ background: cardBg, boxShadow: cardSh, border: `1px solid ${brd}`, borderRadius: 12, ...extra });

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans',sans-serif", color: tP, maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes su{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:${A}30;border-radius:2px}
        input{font-family:'DM Mono',monospace}
        button{font-family:'DM Sans',sans-serif}
      `}</style>

      {/* HEADER */}
      <div style={{ padding: "14px 16px 10px", position: "sticky", top: 0, zIndex: 100, background: dk ? `${bg}F2` : `${bg}EE`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${brd}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 23, fontWeight: 900, background: `linear-gradient(135deg,${A},#E8D5A3)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>⚽ {t.app}</h1>
            <p style={{ fontSize: 9, color: tS, letterSpacing: 3, fontFamily: "'DM Mono',monospace", marginTop: 1 }}>{t.sub}</p>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {Object.entries(LANGS).map(([c, f]) => (
              <button key={c} onClick={() => setLang(c)} style={{ width: 28, height: 28, borderRadius: 7, border: lang === c ? `1.5px solid ${A}50` : `1px solid ${brd}`, background: lang === c ? `${A}18` : "transparent", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: tS, fontFamily: "'DM Mono',monospace", fontWeight: 500 }}>{t.c.prog}</span>
          <span style={{ fontSize: 11, color: A, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{stats.have}/{stats.total} · {((stats.have / stats.total) * 100).toFixed(1)}%</span>
        </div>
        <div style={{ height: 6, background: brd, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${(stats.have / stats.total) * 100}%`, background: `linear-gradient(90deg,${A},#E8D5A3)`, borderRadius: 4, transition: "width 0.5s ease" }} />
        </div>

        {/* Stat chips */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { v: stats.have, l: t.c.have, col: "#2E7D32", bg: "#2E7D3212" },
            { v: stats.need, l: t.c.need, col: "#C62828", bg: "#C6282812" },
            { v: stats.dupes, l: t.c.dupes, col: "#E65100", bg: "#E6510012" },
          ].map(s => (
            <div key={s.l} style={{ flex: 1, padding: "5px 0", borderRadius: 8, background: s.bg, border: `1px solid ${s.col}20`, textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, fontWeight: 700, color: s.col, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 10, color: tS, marginTop: 2, fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 14px 100px" }}>

        {/* COLLECTION */}
        {tab === "col" && (
          <div style={{ animation: "su 0.3s ease" }}>

            {/* Quick Add */}
            <button onClick={() => setShowQA(!showQA)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, ...card(), color: A, fontSize: 12, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", gap: 6, fontWeight: 600, border: `1px solid ${showQA ? A + "35" : brd}`, background: showQA ? `${A}10` : cardBg }}>
              <span style={{ fontSize: 14 }}>⚡</span> {t.c.qa}
              <span style={{ marginLeft: "auto", transform: showQA ? "rotate(180deg)" : "", transition: "0.2s", opacity: 0.6 }}>▾</span>
            </button>
            {showQA && (
              <div style={{ padding: 12, marginBottom: 10, animation: "su 0.2s", ...card() }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={qi} onChange={e => setQi(e.target.value)} onKeyDown={e => e.key === "Enter" && quickAdd()} placeholder={t.c.qaPH}
                    style={{ flex: 1, padding: "9px 12px", borderRadius: 8, background: inputBg, border: `1px solid ${brd}`, color: tP, fontSize: 12, outline: "none" }} />
                  <button onClick={quickAdd} style={{ padding: "9px 16px", borderRadius: 8, background: `linear-gradient(135deg,${A},#E8D5A3)`, border: "none", color: "#07070E", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>{t.c.qaBtn}</button>
                </div>
                <p style={{ fontSize: 11, color: tS, marginTop: 6 }}>{t.c.qaHelp}</p>
              </div>
            )}

            {/* Group nav */}
            <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6, marginBottom: 8, scrollbarWidth: "none" }}>
              {groups.special.filter(s => s.id !== "CC").map(s => {
                const ss = secStats.find(x => x.id === s.id);
                const act = activeSec === s.id;
                return (
                  <button key={s.id} onClick={() => setActiveSec(s.id)} style={{ padding: "6px 10px", borderRadius: 8, background: act ? `${s.color}18` : cardBg, border: `1px solid ${act ? s.color + "55" : brd}`, color: act ? s.color : tS, cursor: "pointer", fontFamily: "'DM Mono',monospace", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0, minWidth: 48, boxShadow: act ? `0 0 0 1px ${s.color}25` : cardSh }}>
                    <span style={{ fontSize: 14 }}>{s.flag}</span>
                    <span style={{ fontSize: 10, fontWeight: 700 }}>{s.id}</span>
                    <span style={{ fontSize: 9, opacity: act ? 0.8 : 0.5 }}>{ss?.pct || 0}%</span>
                  </button>
                );
              })}
              {Object.entries(groups.groups).map(([g, { color, secs }]) => {
                const isA = secs.some(s => s.id === activeSec);
                const gT = secs.length * 20;
                let gH = 0; secs.forEach(s => { getStickerCodes(s).forEach(c => { if (stickers[c] >= 1) gH++; }); });
                return (
                  <button key={g} onClick={() => setActiveSec(secs[0].id)} style={{ padding: "6px 12px", borderRadius: 8, background: isA ? `${color}18` : cardBg, border: `1px solid ${isA ? color + "55" : brd}`, color: isA ? color : tS, cursor: "pointer", fontFamily: "'DM Mono',monospace", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0, minWidth: 48, fontWeight: isA ? 700 : 400, boxShadow: isA ? `0 0 0 1px ${color}25` : cardSh }}>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{g}</span>
                    <span style={{ fontSize: 9, opacity: isA ? 0.8 : 0.5 }}>{Math.round((gH / gT) * 100)}%</span>
                  </button>
                );
              })}
              {groups.special.filter(s => s.id === "CC").map(s => {
                const ss = secStats.find(x => x.id === s.id);
                const act = activeSec === s.id;
                return (
                  <button key={s.id} onClick={() => setActiveSec(s.id)} style={{ padding: "6px 10px", borderRadius: 8, background: act ? `${s.color}18` : cardBg, border: `1px solid ${act ? s.color + "55" : brd}`, color: act ? s.color : tS, cursor: "pointer", fontFamily: "'DM Mono',monospace", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0, minWidth: 48, boxShadow: act ? `0 0 0 1px ${s.color}25` : cardSh }}>
                    <span style={{ fontSize: 14 }}>{s.flag}</span>
                    <span style={{ fontSize: 10, fontWeight: 700 }}>{s.id}</span>
                    <span style={{ fontSize: 9, opacity: act ? 0.8 : 0.5 }}>{ss?.pct || 0}%</span>
                  </button>
                );
              })}
            </div>

            {/* Team tabs */}
            {sec.group && (
              <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                {groups.groups[sec.group]?.secs.map(s => {
                  const ia = activeSec === s.id;
                  const ss = secStats.find(x => x.id === s.id);
                  return (
                    <button key={s.id} onClick={() => setActiveSec(s.id)} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, background: ia ? `${s.color}18` : cardBg, border: `1px solid ${ia ? s.color + "50" : brd}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, boxShadow: ia ? `0 0 0 1px ${s.color}20` : cardSh }}>
                      <span style={{ fontSize: 18 }}>{s.flag}</span>
                      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, fontWeight: 700, color: ia ? s.color : tS }}>{s.id}</span>
                      <span style={{ fontSize: 10, color: ia ? s.color : tS, fontWeight: ia ? 600 : 400 }}>{ss?.pct || 0}%</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Section header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 18 }}>{sec.flag}</span>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700 }}>{sec.name}</span>
              </div>
              <span style={{ fontSize: 11, color: tS, fontFamily: "'DM Mono',monospace" }}>{sec.prefix || "FWC"}1–{sec.count || secCodes.length}</span>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
              {[["all", "fAll"], ["have", "fHave"], ["need", "fNeed"], ["dupes", "fDupes"]].map(([f, k]) => (
                <button key={f} onClick={() => setFilter(f)} style={{ flex: 1, padding: "6px 4px", borderRadius: 7, background: filter === f ? `${A}18` : cardBg, border: `1px solid ${filter === f ? A + "45" : brd}`, color: filter === f ? A : tS, fontSize: 11, cursor: "pointer", fontWeight: filter === f ? 700 : 400, boxShadow: filter === f ? "none" : cardSh }}>{t.c[k]}</button>
              ))}
            </div>

            {/* Sticker grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {filtered.map(c => <Cell key={c} code={c} status={stickers[c] || 0} color={sec.color} onTap={tap} onReset={reset} dk={dk} />)}
            </div>
            <p style={{ textAlign: "center", fontSize: 11, color: tS, marginTop: 10, lineHeight: 1.5 }}>{t.c.help}</p>
          </div>
        )}

        {/* MARKET */}
        {tab === "mkt" && (
          <div style={{ animation: "su 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900 }}>{t.m.title}</h2>
              <span style={{ fontSize: 11, color: tS }}>{t.m.free}</span>
            </div>
            <p style={{ fontSize: 11, color: A, marginBottom: 14, cursor: "pointer" }} onClick={() => setShowPrem(true)}>✦ {t.m.premium}</p>

            {myDupes.length > 0 && (
              <div style={{ padding: "10px 12px", borderRadius: 10, marginBottom: 8, background: `${A}0C`, border: `1px solid ${A}20`, display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 20 }}>📦</span>
                <div>
                  <div style={{ fontSize: 12, color: A, fontWeight: 600 }}>{myDupes.length} {t.c.dupes.toLowerCase()}</div>
                  <div style={{ fontSize: 11, color: tS, marginTop: 1 }}>{myNeeds.length} {t.c.need.toLowerCase()}</div>
                </div>
              </div>
            )}

            {/* Share duplicates */}
            <div style={{ padding: "12px 14px", borderRadius: 12, marginBottom: 12, ...card() }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: tP, marginBottom: 8 }}>{t.sh.title}</div>
              {myDupes.length > 0 ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={generateShareImage} style={{ flex: 1, padding: "9px 8px", borderRadius: 8, background: `linear-gradient(135deg,${A},#E8D5A3)`, border: "none", color: "#07070E", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{t.sh.img}</button>
                  <button onClick={copyDupesText} style={{ flex: 1, padding: "9px 8px", borderRadius: 8, background: copyDone ? "#2E7D3215" : inputBg, border: `1px solid ${copyDone ? "#2E7D3240" : brd}`, color: copyDone ? "#2E7D32" : tP, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>{copyDone ? t.sh.copied : t.sh.txt}</button>
                </div>
              ) : (
                <p style={{ fontSize: 11, color: tS }}>{t.sh.none}</p>
              )}
            </div>

            {matched.map(o => (
              <div key={o.id} style={{ padding: 14, borderRadius: 12, marginBottom: 8, position: "relative", ...card() }}>
                {o.ms > 0 && (
                  <div style={{ position: "absolute", top: 10, right: 10, background: `${A}18`, color: A, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, fontFamily: "'DM Mono',monospace", border: `1px solid ${A}25` }}>🎯 {o.ms} {t.m.match}</div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 18, background: `${A}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: A, fontFamily: "'DM Mono',monospace", flexShrink: 0 }}>{o.user[0]}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{o.user}</div>
                    <div style={{ fontSize: 11, color: tS, marginTop: 1 }}>📍 {o.city} · {o.time}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: tS, fontFamily: "'DM Mono',monospace", fontWeight: 500, marginBottom: 4, letterSpacing: 0.5 }}>{t.m.offers.toUpperCase()}</div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {o.offers.map(n => (
                        <span key={n} style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, background: myNeeds.includes(n) ? "#2E7D3220" : (dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"), color: myNeeds.includes(n) ? "#2E7D32" : tS, fontFamily: "'DM Mono',monospace", fontWeight: myNeeds.includes(n) ? 700 : 400, border: myNeeds.includes(n) ? "1px solid #2E7D3235" : `1px solid ${brd}` }}>{n}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ width: 1, background: brd, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: tS, fontFamily: "'DM Mono',monospace", fontWeight: 500, marginBottom: 4, letterSpacing: 0.5 }}>{t.m.needs.toUpperCase()}</div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {o.needs.map(n => (
                        <span key={n} style={{ padding: "2px 6px", borderRadius: 4, fontSize: 10, background: myDupes.includes(n) ? `${A}18` : (dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"), color: myDupes.includes(n) ? A : tS, fontFamily: "'DM Mono',monospace", fontWeight: myDupes.includes(n) ? 700 : 400, border: myDupes.includes(n) ? `1px solid ${A}30` : `1px solid ${brd}` }}>{n}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button style={{ width: "100%", padding: "9px 0", borderRadius: 8, background: o.ms > 0 ? `linear-gradient(135deg,${A},#E8D5A3)` : (dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"), border: o.ms > 0 ? "none" : `1px solid ${brd}`, color: o.ms > 0 ? "#07070E" : tS, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{t.m.contact}</button>
              </div>
            ))}
          </div>
        )}

        {/* STATS */}
        {tab === "stats" && (
          <div style={{ animation: "su 0.3s ease" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, marginBottom: 14 }}>{t.s.title}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                { l: t.s.comp, v: `${((stats.have / stats.total) * 100).toFixed(1)}%`, i: "✓", c: "#2E7D32" },
                { l: t.s.rem,  v: stats.need,  i: "✗", c: "#C62828" },
                { l: t.s.dup,  v: stats.dupes, i: "⟳", c: "#E65100" },
                { l: t.s.packs, v: Math.ceil(stats.need / 7), i: "📦", c: "#1565C0" },
              ].map(c => (
                <div key={c.l} style={{ padding: "14px 12px", ...card() }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>{c.i}</span>
                    <span style={{ fontSize: 10, color: tS, fontFamily: "'DM Mono',monospace", letterSpacing: 0.8, fontWeight: 500 }}>{c.l.toUpperCase()}</span>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: c.c, lineHeight: 1 }}>{c.v}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 16px", borderRadius: 12, marginBottom: 16, background: `${A}0A`, border: `1px solid ${A}18`, boxShadow: cardSh }}>
              <span style={{ fontSize: 10, color: tS, fontFamily: "'DM Mono',monospace", letterSpacing: 0.8, fontWeight: 500 }}>{t.s.cost.toUpperCase()}</span>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: A, marginTop: 4, lineHeight: 1 }}>~${(Math.ceil(stats.need / 7) * 1.7).toFixed(0)} <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.7 }}>USD</span></div>
            </div>
            <h3 style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: tS, letterSpacing: 2, marginBottom: 10, fontWeight: 500 }}>{t.s.bySec.toUpperCase()}</h3>
            {Object.entries(groups.groups)
              .map(([g, { color, secs }]) => {
                const gT = secs.length * 20;
                let gH = 0; secs.forEach(s => { getStickerCodes(s).forEach(c => { if (stickers[c] >= 1) gH++; }); });
                const p = Math.round((gH / gT) * 100);
                const sortedSecs = [...secs].sort((a, b) => {
                  const ssA = secStats.find(x => x.id === a.id);
                  const ssB = secStats.find(x => x.id === b.id);
                  return (ssB?.pct || 0) - (ssA?.pct || 0);
                });
                return { g, color, secs: sortedSecs, gT, gH, p };
              })
              .sort((a, b) => b.p - a.p)
              .map(({ g, color, secs, gT, gH, p }) => (
                <div key={g} style={{ marginBottom: 10, padding: "10px 12px", ...card() }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color, fontWeight: 700, letterSpacing: 1 }}>GRUPO {g}</span>
                    <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: tS }}>{gH}/{gT} · {p}%</span>
                  </div>
                  <div style={{ height: 4, background: brd, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${p}%`, background: color, borderRadius: 3, transition: "width 0.4s" }} />
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {secs.map(s => {
                      const ss = secStats.find(x => x.id === s.id);
                      return (
                        <div key={s.id} style={{ flex: 1, textAlign: "center", padding: "5px 2px", borderRadius: 7, background: dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
                          <span style={{ fontSize: 14 }}>{s.flag}</span>
                          <div style={{ color: tS, fontFamily: "'DM Mono',monospace", fontSize: 10, marginTop: 2 }}>{ss?.have}/{ss?.total}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* SETTINGS */}
        {tab === "cfg" && (
          <div style={{ animation: "su 0.3s ease" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, marginBottom: 14 }}>{t.cfg.title}</h2>

            {/* Premium banner */}
            <div onClick={() => setShowPrem(true)} style={{ padding: "14px 16px", borderRadius: 12, marginBottom: 10, cursor: "pointer", background: `linear-gradient(135deg,${A}15,${A}08)`, border: `1px solid ${A}25`, display: "flex", alignItems: "center", gap: 12, boxShadow: cardSh }}>
              <span style={{ fontSize: 26 }}>⭐</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, color: A, fontWeight: 700 }}>{t.prem.title}</div>
                <div style={{ fontSize: 11, color: tS, marginTop: 2 }}>{t.prem.price} · {t.prem.feats[0].toLowerCase()}</div>
              </div>
              <span style={{ color: A, fontSize: 16, opacity: 0.7 }}>›</span>
            </div>

            {/* QR download app */}
            {loaded && (
              <div style={{ padding: "14px", borderRadius: 12, marginBottom: 8, ...card(), display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: tP, alignSelf: "flex-start" }}>{t.cfg.shareApp}</span>
                <div style={{ padding: 10, borderRadius: 10, background: "#fff" }}>
                  <QRCodeSVG value={window.location.origin} size={130} bgColor="#ffffff" fgColor="#07070E" />
                </div>
                <span style={{ fontSize: 10, color: tS, fontFamily: "'DM Mono',monospace" }}>{window.location.origin}</span>
              </div>
            )}

            {/* Theme toggle */}
            <div style={{ padding: "12px 14px", borderRadius: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", ...card() }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{t.cfg.theme}</span>
              <div style={{ display: "flex", gap: 4, background: brd, borderRadius: 8, padding: 3 }}>
                {["light", "dark"].map(th => (
                  <button key={th} onClick={() => setTheme(th)} style={{ padding: "5px 14px", borderRadius: 6, background: theme === th ? cardBg : "transparent", border: "none", color: theme === th ? tP : tS, fontSize: 11, cursor: "pointer", fontWeight: theme === th ? 600 : 400, boxShadow: theme === th ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}>{t.cfg[th]}</button>
                ))}
              </div>
            </div>

            {/* Actions */}
            {[
              { l: t.cfg.exp, i: "📤", a: () => { const d = JSON.stringify(stickers); const b = new Blob([d], { type: "application/json" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "stickertrack.json"; a.click(); } },
              { l: t.cfg.imp, i: "📥", a: () => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json"; inp.onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { try { setStickers(JSON.parse(ev.target.result)); } catch { } }; r.readAsText(f); }; inp.click(); } },
              { l: t.cfg.reset, i: "🗑️", d: true, a: () => { if (confirm("Reset?")) setStickers({}); } },
            ].map(item => (
              <button key={item.l} onClick={item.a} style={{ width: "100%", padding: "13px 14px", borderRadius: 12, marginBottom: 6, ...card(), border: `1px solid ${item.d ? "#C6282820" : brd}`, color: item.d ? "#C62828" : tP, display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: 500 }}>
                <span style={{ fontSize: 16 }}>{item.i}</span>{item.l}
              </button>
            ))}
            <p style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: tS, fontFamily: "'DM Mono',monospace" }}>v3.0 · {TOTAL} stickers · 48 equipos · Panini WC2026</p>
          </div>
        )}
      </div>

      {/* PREMIUM MODAL */}
      {showPrem && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fi 0.25s" }} onClick={() => setShowPrem(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 320, borderRadius: 18, background: dk ? "#14141E" : "#FFF", border: `1px solid ${A}30`, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <span style={{ fontSize: 40 }}>⭐</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, marginTop: 6, color: A, fontWeight: 900 }}>{t.prem.title}</h2>
              <p style={{ fontSize: 24, fontWeight: 900, fontFamily: "'Playfair Display',serif", marginTop: 4, color: tP }}>{t.prem.price}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {t.prem.feats.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${brd}` }}>
                  <span style={{ color: A, fontSize: 13, fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 13 }}>{f}</span>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", padding: 13, borderRadius: 10, background: `linear-gradient(135deg,${A},#E8D5A3)`, border: "none", color: "#07070E", fontSize: 14, fontWeight: 800, cursor: "pointer", letterSpacing: 1.5 }}>{t.prem.sub.toUpperCase()}</button>
            <button onClick={() => setShowPrem(false)} style={{ width: "100%", padding: 8, background: "transparent", border: "none", color: tS, fontSize: 12, cursor: "pointer", marginTop: 6 }}>{t.prem.close}</button>
          </div>
        </div>
      )}

      {/* TAB BAR */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: dk ? `#0A0A12F0` : `#F2EFE7F0`, backdropFilter: "blur(20px)", borderTop: `1px solid ${brd}`, display: "flex", padding: "6px 8px 10px", zIndex: 99 }}>
        {[{ k: "col", i: "📖" }, { k: "mkt", i: "🔄" }, { k: "stats", i: "📊" }, { k: "cfg", i: "⚙️" }].map(tb => (
          <button key={tb.k} onClick={() => setTab(tb.k)} style={{ flex: 1, padding: "6px 2px", borderRadius: 9, background: tab === tb.k ? `${A}12` : "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "background 0.15s" }}>
            <span style={{ fontSize: 18, filter: tab === tb.k ? "none" : "grayscale(1) opacity(0.4)" }}>{tb.i}</span>
            <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: tab === tb.k ? A : tS, letterSpacing: 0.5, fontWeight: tab === tb.k ? 700 : 400 }}>{t.tabs[tb.k]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
