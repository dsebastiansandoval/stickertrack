'use client';
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

// ═══════════════════════════════════════════
// PERSISTENCE: localStorage for offline-first
// ═══════════════════════════════════════════
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
  if (typeof window === 'undefined') return { lang: 'es', theme: 'dark' };
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{"lang":"es","theme":"dark"}'); } catch { return { lang: 'es', theme: 'dark' }; }
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
      help: "Toque: falta → tengo → +repetida. Mantener: volver a falta.",
      qa: "Agregar rápido", qaPH: "Ej: MEX1, BRA5, ARG1-ARG20",
      qaBtn: "Agregar", qaHelp: "Usa prefijos reales. Comas para separar, guión para rangos." },
    m: { title: "Mercado", offers: "Ofrece", needs: "Busca", contact: "Contactar",
      free: "Gratis hasta 5/mes", premium: "Premium: ilimitados", match: "Match" },
    s: { title: "Estadísticas", bySec: "Por grupo", comp: "Completado",
      rem: "Faltan", dup: "Repetidas", packs: "Sobres est.", cost: "Costo est." },
    cfg: { title: "Ajustes", theme: "Tema", dark: "Oscuro", light: "Claro",
      exp: "Exportar datos", imp: "Importar datos", reset: "Reiniciar" },
    promo: { sp: "Patrocinado", more: "Más" },
    prem: { title: "StickerTrack Premium", price: "$2.99/mes",
      feats: ["Intercambios ilimitados","Sin publicidad","Stats avanzadas","Exportar Excel","Soporte prioritario"],
      sub: "Suscribirse", close: "Cerrar" },
  },
  en: {
    app: "StickerTrack", sub: "WORLD CUP 2026 · TRACKER",
    tabs: { col: "Collection", mkt: "Market", stats: "Stats", cfg: "Settings" },
    c: { have: "Have", need: "Need", dupes: "Dupes", prog: "Progress",
      fAll: "All", fHave: "Have", fNeed: "Need", fDupes: "Dupes",
      help: "Tap: need → have → +dupe. Hold: reset.",
      qa: "Quick Add", qaPH: "E.g.: MEX1, BRA5, ARG1-ARG20",
      qaBtn: "Add", qaHelp: "Use real prefixes. Comma-separated, dash for ranges." },
    m: { title: "Market", offers: "Offers", needs: "Needs", contact: "Contact",
      free: "Free up to 5/mo", premium: "Premium: unlimited", match: "Match" },
    s: { title: "Statistics", bySec: "By group", comp: "Completed",
      rem: "Remaining", dup: "Duplicates", packs: "Est. packs", cost: "Est. cost" },
    cfg: { title: "Settings", theme: "Theme", dark: "Dark", light: "Light",
      exp: "Export", imp: "Import", reset: "Reset" },
    promo: { sp: "Sponsored", more: "More" },
    prem: { title: "StickerTrack Premium", price: "$2.99/mo",
      feats: ["Unlimited trades","No ads","Advanced stats","Export Excel","Priority support"],
      sub: "Subscribe", close: "Close" },
  },
  fr: {
    app: "StickerTrack", sub: "COUPE DU MONDE 2026 · TRACKER",
    tabs: { col: "Collection", mkt: "Marché", stats: "Stats", cfg: "Réglages" },
    c: { have: "J'ai", need: "Manquantes", dupes: "Doubles", prog: "Progrès",
      fAll: "Toutes", fHave: "J'ai", fNeed: "Manquantes", fDupes: "Doubles",
      help: "Toucher: manquante → j'ai → +double. Maintenir: réinit.",
      qa: "Ajout rapide", qaPH: "Ex: MEX1, BRA5, ARG1-ARG20",
      qaBtn: "Ajouter", qaHelp: "Préfixes réels. Virgules, tiret pour plages." },
    m: { title: "Marché", offers: "Offre", needs: "Cherche", contact: "Contacter",
      free: "Gratuit 5/mois", premium: "Premium: illimités", match: "Match" },
    s: { title: "Statistiques", bySec: "Par groupe", comp: "Complété",
      rem: "Restant", dup: "Doubles", packs: "Pochettes est.", cost: "Coût est." },
    cfg: { title: "Réglages", theme: "Thème", dark: "Sombre", light: "Clair",
      exp: "Exporter", imp: "Importer", reset: "Réinit." },
    promo: { sp: "Sponsorisé", more: "Plus" },
    prem: { title: "StickerTrack Premium", price: "2,99€/mois",
      feats: ["Échanges illimités","Sans pub","Stats avancées","Export Excel","Support prioritaire"],
      sub: "S'abonner", close: "Fermer" },
  },
  pt: {
    app: "StickerTrack", sub: "COPA 2026 · TRACKER",
    tabs: { col: "Coleção", mkt: "Mercado", stats: "Stats", cfg: "Config" },
    c: { have: "Tenho", need: "Faltam", dupes: "Repetidas", prog: "Progresso",
      fAll: "Todas", fHave: "Tenho", fNeed: "Faltam", fDupes: "Repetidas",
      help: "Toque: falta → tenho → +repetida. Segurar: voltar.",
      qa: "Adicionar rápido", qaPH: "Ex: MEX1, BRA5, ARG1-ARG20",
      qaBtn: "Adicionar", qaHelp: "Prefixos reais. Vírgulas, traço p/ intervalos." },
    m: { title: "Mercado", offers: "Oferece", needs: "Procura", contact: "Contatar",
      free: "Grátis 5/mês", premium: "Premium: ilimitadas", match: "Match" },
    s: { title: "Estatísticas", bySec: "Por grupo", comp: "Completo",
      rem: "Faltam", dup: "Repetidas", packs: "Pacotes est.", cost: "Custo est." },
    cfg: { title: "Config", theme: "Tema", dark: "Escuro", light: "Claro",
      exp: "Exportar", imp: "Importar", reset: "Resetar" },
    promo: { sp: "Patrocinado", more: "Mais" },
    prem: { title: "StickerTrack Premium", price: "R$14,90/mês",
      feats: ["Trocas ilimitadas","Sem anúncios","Stats avançadas","Exportar Excel","Suporte prioritário"],
      sub: "Assinar", close: "Fechar" },
  },
};

// ═══════════════════════════════════════════
// REAL PANINI CHECKLIST — Album order by group
// ═══════════════════════════════════════════
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
];

function getStickerCodes(section) {
  if (section.codes) return section.codes;
  return Array.from({ length: section.count }, (_, i) => `${section.prefix}${i + 1}`);
}

const ALL_CODES = ALBUM.flatMap(getStickerCodes);
const TOTAL = ALL_CODES.length; // 980

// ═══════════════════════════════════════════
function Cell({ code, status, color, onTap, onReset }) {
  const pressing = useRef(false);
  const tmr = useRef(null);
  const didL = useRef(false);
  const dn = () => { pressing.current = true; didL.current = false; tmr.current = setTimeout(() => { didL.current = true; onReset(code); pressing.current = false; }, 600); };
  const up = () => { if (tmr.current) clearTimeout(tmr.current); if (pressing.current && !didL.current) onTap(code); pressing.current = false; };
  const lv = () => { if (tmr.current) clearTimeout(tmr.current); pressing.current = false; };
  const owned = status >= 1, dupe = status > 1;
  const short = code.replace(/[0-9]+$/, "");
  const num = code.replace(/^[A-Z]+/, "");
  return (
    <div onMouseDown={dn} onMouseUp={up} onMouseLeave={lv}
      onTouchStart={dn} onTouchEnd={e => { e.preventDefault(); up(); }}
      style={{
        width: "100%", aspectRatio: "2.2/1", borderRadius: 6,
        background: owned ? (dupe ? `linear-gradient(135deg,${color}35,${color}55)` : `${color}22`) : "rgba(255,255,255,0.02)",
        border: `1.5px solid ${owned ? (dupe ? color + "90" : color + "40") : "rgba(255,255,255,0.05)"}`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 2,
        cursor: "pointer", userSelect: "none", position: "relative",
        transition: "all 0.12s", transform: pressing ? "scale(0.9)" : "scale(1)",
        boxShadow: dupe ? `0 1px 8px ${color}20` : "none", padding: "0 3px",
      }}>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, fontWeight: 500, color: owned ? color : "rgba(255,255,255,0.08)", letterSpacing: 0.3 }}>{short}</span>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, fontWeight: 700, color: owned ? "#fff" : "rgba(255,255,255,0.12)" }}>{num}</span>
      {dupe && <div style={{ position: "absolute", top: -4, right: -4, background: "#E53935", borderRadius: 8, padding: "0 4px", fontSize: 8, fontWeight: 800, color: "#fff", fontFamily: "'DM Mono',monospace", lineHeight: "14px", minWidth: 14, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>×{status}</div>}
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
  const [theme, setTheme] = useState("dark");
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadCollection();
    const settings = loadSettings();
    setStickers(saved);
    setLang(settings.lang || "es");
    setTheme(settings.theme || "dark");
    setLoaded(true);
  }, []);

  // Save stickers whenever they change
  useEffect(() => { if (loaded) saveCollection(stickers); }, [stickers, loaded]);

  // Save settings whenever they change
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

  const dk = theme === "dark";
  const bg = dk ? "#07070E" : "#F5F2EB";
  const cBg = dk ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.03)";
  const tP = dk ? "#E8E4DA" : "#1A1A1A";
  const tS = dk ? "#555" : "#999";
  const brd = dk ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.07)";

  const groups = useMemo(() => {
    const g = {}, sp = [];
    ALBUM.forEach(s => { if (s.group) { if (!g[s.group]) g[s.group] = { color: s.color, secs: [] }; g[s.group].secs.push(s); } else sp.push(s); });
    return { groups: g, special: sp };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'DM Sans',sans-serif", color: tP, maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes su{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes fi{from{opacity:0}to{opacity:1}}*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:${A}30;border-radius:2px}input{font-family:'DM Mono',monospace}`}</style>

      {/* HEADER */}
      <div style={{ padding: "14px 14px 8px", position: "sticky", top: 0, zIndex: 100, background: `${bg}F0`, backdropFilter: "blur(16px)", borderBottom: `1px solid ${brd}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, background: `linear-gradient(135deg,${A},#E8D5A3)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>⚽ {t.app}</h1>
            <p style={{ fontSize: 8, color: tS, letterSpacing: 3, fontFamily: "'DM Mono',monospace" }}>{t.sub}</p>
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {Object.entries(LANGS).map(([c, f]) => (
              <button key={c} onClick={() => setLang(c)} style={{ width: 26, height: 26, borderRadius: 5, border: "none", background: lang === c ? `${A}20` : "transparent", fontSize: 13, cursor: "pointer", outline: lang === c ? `2px solid ${A}30` : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 8, color: tS, fontFamily: "'DM Mono',monospace" }}>{t.c.prog}</span>
            <span style={{ fontSize: 8, color: A, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{stats.have}/{stats.total} ({((stats.have / stats.total) * 100).toFixed(1)}%)</span>
          </div>
          <div style={{ height: 5, background: brd, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(stats.have / stats.total) * 100}%`, background: `linear-gradient(90deg,${A},#E8D5A3)`, borderRadius: 3, transition: "width 0.5s" }} />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 3 }}>
            <span style={{ fontSize: 8, color: tS, fontFamily: "'DM Mono',monospace" }}>✓{stats.have} {t.c.have}</span>
            <span style={{ fontSize: 8, color: tS, fontFamily: "'DM Mono',monospace" }}>✗{stats.need} {t.c.need}</span>
            <span style={{ fontSize: 8, color: tS, fontFamily: "'DM Mono',monospace" }}>⟳{stats.dupes} {t.c.dupes}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 12px 100px" }}>
        {/* COLLECTION */}
        {tab === "col" && (
          <div style={{ animation: "su 0.3s ease" }}>
            <button onClick={() => setShowQA(!showQA)} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, background: showQA ? `${A}10` : cBg, border: `1px solid ${showQA ? A + "25" : brd}`, color: A, fontSize: 10, cursor: "pointer", fontFamily: "'DM Mono',monospace", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              ⚡ {t.c.qa}<span style={{ marginLeft: "auto", transform: showQA ? "rotate(180deg)" : "", transition: "0.2s" }}>▾</span>
            </button>
            {showQA && (
              <div style={{ padding: 10, borderRadius: 7, background: cBg, border: `1px solid ${brd}`, marginBottom: 8, animation: "su 0.2s" }}>
                <div style={{ display: "flex", gap: 5 }}>
                  <input value={qi} onChange={e => setQi(e.target.value)} onKeyDown={e => e.key === "Enter" && quickAdd()} placeholder={t.c.qaPH} style={{ flex: 1, padding: "7px 9px", borderRadius: 5, background: dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${brd}`, color: tP, fontSize: 11, outline: "none" }} />
                  <button onClick={quickAdd} style={{ padding: "7px 14px", borderRadius: 5, background: `linear-gradient(135deg,${A},#E8D5A3)`, border: "none", color: "#07070E", fontWeight: 700, fontSize: 10, cursor: "pointer" }}>{t.c.qaBtn}</button>
                </div>
                <p style={{ fontSize: 7, color: tS, marginTop: 3 }}>{t.c.qaHelp}</p>
              </div>
            )}

            {/* Group nav */}
            <div style={{ display: "flex", gap: 3, overflowX: "auto", paddingBottom: 5, marginBottom: 7, scrollbarWidth: "none" }}>
              {groups.special.map(s => {
                const ss = secStats.find(x => x.id === s.id);
                return (<button key={s.id} onClick={() => setActiveSec(s.id)} style={{ padding: "5px 8px", borderRadius: 5, background: activeSec === s.id ? `${s.color}20` : cBg, border: `1px solid ${activeSec === s.id ? s.color + "50" : brd}`, color: activeSec === s.id ? s.color : tS, fontSize: 8, cursor: "pointer", fontFamily: "'DM Mono',monospace", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, flexShrink: 0, minWidth: 44 }}>
                  <span>{s.flag}</span><span>{s.id}</span><span style={{ fontSize: 6, opacity: 0.6 }}>{ss?.pct || 0}%</span>
                </button>);
              })}
              {Object.entries(groups.groups).map(([g, { color, secs }]) => {
                const isA = secs.some(s => s.id === activeSec);
                const gT = secs.length * 20;
                let gH = 0; secs.forEach(s => { getStickerCodes(s).forEach(c => { if (stickers[c] >= 1) gH++; }); });
                return (<button key={g} onClick={() => setActiveSec(secs[0].id)} style={{ padding: "5px 10px", borderRadius: 5, background: isA ? `${color}20` : cBg, border: `1px solid ${isA ? color + "50" : brd}`, color: isA ? color : tS, fontSize: 8, cursor: "pointer", fontFamily: "'DM Mono',monospace", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, flexShrink: 0, minWidth: 44, fontWeight: isA ? 700 : 400 }}>
                  <span style={{ fontSize: 10, fontWeight: 700 }}>G{g}</span><span style={{ fontSize: 6, opacity: 0.6 }}>{Math.round((gH / gT) * 100)}%</span>
                </button>);
              })}
            </div>

            {/* Team tabs */}
            {sec.group && (
              <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                {groups.groups[sec.group]?.secs.map(s => {
                  const ia = activeSec === s.id;
                  const ss = secStats.find(x => x.id === s.id);
                  return (<button key={s.id} onClick={() => setActiveSec(s.id)} style={{ flex: 1, padding: "6px 3px", borderRadius: 7, background: ia ? `${s.color}20` : cBg, border: `1px solid ${ia ? s.color + "45" : brd}`, color: ia ? "#fff" : tS, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <span style={{ fontSize: 16 }}>{s.flag}</span>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, fontWeight: 700 }}>{s.id}</span>
                    <span style={{ fontSize: 6, color: ia ? s.color : tS }}>{ss?.pct || 0}%</span>
                  </button>);
                })}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 14 }}>{sec.flag}</span>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700 }}>{sec.name}</span>
              </div>
              <span style={{ fontSize: 8, color: tS, fontFamily: "'DM Mono',monospace" }}>{sec.prefix || "FWC"}1–{sec.count || secCodes.length}</span>
            </div>

            <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
              {[["all", "fAll"], ["have", "fHave"], ["need", "fNeed"], ["dupes", "fDupes"]].map(([f, k]) => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: "4px 9px", borderRadius: 4, background: filter === f ? `${A}15` : "transparent", border: `1px solid ${filter === f ? A + "35" : brd}`, color: filter === f ? A : tS, fontSize: 8, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>{t.c[k]}</button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
              {filtered.map(c => <Cell key={c} code={c} status={stickers[c] || 0} color={sec.color} onTap={tap} onReset={reset} />)}
            </div>
            <p style={{ textAlign: "center", fontSize: 7, color: tS, marginTop: 8, fontFamily: "'DM Mono',monospace" }}>{t.c.help}</p>
          </div>
        )}

        {/* MARKET */}
        {tab === "mkt" && (
          <div style={{ animation: "su 0.3s ease" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, marginBottom: 2 }}>{t.m.title}</h2>
            <p style={{ fontSize: 8, color: tS, fontFamily: "'DM Mono',monospace", marginBottom: 12 }}>{t.m.free} · <span style={{ color: A, cursor: "pointer" }} onClick={() => setShowPrem(true)}>{t.m.premium}</span></p>
            {myDupes.length > 0 && <div style={{ padding: 8, borderRadius: 6, marginBottom: 10, background: `${A}08`, border: `1px solid ${A}12`, fontSize: 8, color: A, fontFamily: "'DM Mono',monospace" }}>📦 {myDupes.length} {t.c.dupes.toLowerCase()} · ✗ {myNeeds.length} {t.c.need.toLowerCase()}</div>}
            {matched.map(o => (
              <div key={o.id} style={{ padding: 12, borderRadius: 9, marginBottom: 7, background: cBg, border: `1px solid ${brd}`, position: "relative" }}>
                {o.ms > 0 && <div style={{ position: "absolute", top: 7, right: 7, background: `${A}18`, color: A, fontSize: 7, fontWeight: 700, padding: "1px 5px", borderRadius: 3, fontFamily: "'DM Mono',monospace" }}>🎯 {o.ms} {t.m.match}</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 15, background: `${A}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: A, fontFamily: "'DM Mono',monospace" }}>{o.user[0]}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{o.user}</div>
                    <div style={{ fontSize: 7, color: tS, fontFamily: "'DM Mono',monospace" }}>📍 {o.city} · {o.time}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 7, color: tS, fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>{t.m.offers}:</div>
                    <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>{o.offers.map(n => (
                      <span key={n} style={{ padding: "1px 4px", borderRadius: 3, fontSize: 8, background: myNeeds.includes(n) ? "#2E7D3225" : "rgba(255,255,255,0.04)", color: myNeeds.includes(n) ? "#4CAF50" : tS, fontFamily: "'DM Mono',monospace", fontWeight: myNeeds.includes(n) ? 700 : 400 }}>{n}</span>
                    ))}</div>
                  </div>
                  <div style={{ width: 1, background: brd }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 7, color: tS, fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>{t.m.needs}:</div>
                    <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>{o.needs.map(n => (
                      <span key={n} style={{ padding: "1px 4px", borderRadius: 3, fontSize: 8, background: myDupes.includes(n) ? `${A}18` : "rgba(255,255,255,0.04)", color: myDupes.includes(n) ? A : tS, fontFamily: "'DM Mono',monospace", fontWeight: myDupes.includes(n) ? 700 : 400 }}>{n}</span>
                    ))}</div>
                  </div>
                </div>
                <button style={{ width: "100%", padding: 6, borderRadius: 5, background: o.ms > 0 ? `linear-gradient(135deg,${A},#E8D5A3)` : cBg, border: o.ms > 0 ? "none" : `1px solid ${brd}`, color: o.ms > 0 ? "#07070E" : tS, fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>{t.m.contact}</button>
              </div>
            ))}
          </div>
        )}

        {/* STATS */}
        {tab === "stats" && (
          <div style={{ animation: "su 0.3s ease" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, marginBottom: 12 }}>{t.s.title}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
              {[
                { l: t.s.comp, v: `${((stats.have / stats.total) * 100).toFixed(1)}%`, i: "✓", c: "#2E7D32" },
                { l: t.s.rem, v: stats.need, i: "✗", c: "#C62828" },
                { l: t.s.dup, v: stats.dupes, i: "⟳", c: "#F57F17" },
                { l: t.s.packs, v: Math.ceil(stats.need / 7), i: "📦", c: "#1565C0" },
              ].map(c => (
                <div key={c.l} style={{ padding: 12, borderRadius: 9, background: cBg, border: `1px solid ${brd}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
                    <span style={{ fontSize: 11 }}>{c.i}</span>
                    <span style={{ fontSize: 7, color: tS, fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>{c.l.toUpperCase()}</span>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: c.c }}>{c.v}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: 12, borderRadius: 9, marginBottom: 14, background: `${A}06`, border: `1px solid ${A}12` }}>
              <span style={{ fontSize: 7, color: tS, fontFamily: "'DM Mono',monospace" }}>{t.s.cost.toUpperCase()}</span>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: A, marginTop: 2 }}>~${(Math.ceil(stats.need / 7) * 1.7).toFixed(0)} USD</div>
            </div>
            <h3 style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: tS, letterSpacing: 2, marginBottom: 8 }}>{t.s.bySec.toUpperCase()}</h3>
            {Object.entries(groups.groups).map(([g, { color, secs }]) => {
              const gT = secs.length * 20;
              let gH = 0; secs.forEach(s => { getStickerCodes(s).forEach(c => { if (stickers[c] >= 1) gH++; }); });
              const p = Math.round((gH / gT) * 100);
              return (<div key={g} style={{ marginBottom: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color, fontWeight: 700 }}>GROUP {g}</span>
                  <span style={{ fontSize: 8, fontFamily: "'DM Mono',monospace", color: tS }}>{gH}/{gT} — {p}%</span>
                </div>
                <div style={{ height: 3, background: brd, borderRadius: 2, overflow: "hidden", marginBottom: 3 }}>
                  <div style={{ height: "100%", width: `${p}%`, background: color, borderRadius: 2, transition: "width 0.4s" }} />
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  {secs.map(s => { const ss = secStats.find(x => x.id === s.id);
                    return (<div key={s.id} style={{ flex: 1, textAlign: "center", padding: "3px 1px", borderRadius: 5, background: cBg, fontSize: 7 }}>
                      <span style={{ fontSize: 12 }}>{s.flag}</span>
                      <div style={{ color: tS, fontFamily: "'DM Mono',monospace", marginTop: 1 }}>{ss?.have}/{ss?.total}</div>
                    </div>);
                  })}
                </div>
              </div>);
            })}
          </div>
        )}

        {/* SETTINGS */}
        {tab === "cfg" && (
          <div style={{ animation: "su 0.3s ease" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, marginBottom: 12 }}>{t.cfg.title}</h2>
            <div onClick={() => setShowPrem(true)} style={{ padding: 14, borderRadius: 10, marginBottom: 12, cursor: "pointer", background: `${A}10`, border: `1px solid ${A}20`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22 }}>⭐</span>
              <div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, color: A }}>{t.prem.title}</div><div style={{ fontSize: 8, color: tS, fontFamily: "'DM Mono',monospace" }}>{t.prem.price}</div></div>
              <span style={{ marginLeft: "auto", color: A }}>→</span>
            </div>
            <div style={{ padding: 12, borderRadius: 9, background: cBg, border: `1px solid ${brd}`, marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11 }}>{t.cfg.theme}</span>
              <div style={{ display: "flex", gap: 3 }}>
                {["dark", "light"].map(th => (
                  <button key={th} onClick={() => setTheme(th)} style={{ padding: "4px 10px", borderRadius: 4, background: theme === th ? `${A}18` : "transparent", border: `1px solid ${theme === th ? A + "35" : brd}`, color: theme === th ? A : tS, fontSize: 9, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>{t.cfg[th]}</button>
                ))}
              </div>
            </div>
            {[
              { l: t.cfg.exp, i: "📤", a: () => { const d = JSON.stringify(stickers); const b = new Blob([d], { type: "application/json" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "stickertrack.json"; a.click(); } },
              { l: t.cfg.imp, i: "📥", a: () => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json"; inp.onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => { try { setStickers(JSON.parse(ev.target.result)); } catch { } }; r.readAsText(f); }; inp.click(); } },
              { l: t.cfg.reset, i: "🗑️", d: true, a: () => { if (confirm("Reset?")) setStickers({}); } },
            ].map(item => (
              <button key={item.l} onClick={item.a} style={{ width: "100%", padding: 12, borderRadius: 9, marginBottom: 5, background: cBg, border: `1px solid ${item.d ? "#C6282825" : brd}`, color: item.d ? "#C62828" : tP, display: "flex", alignItems: "center", gap: 7, fontSize: 11, cursor: "pointer", textAlign: "left" }}><span>{item.i}</span>{item.l}</button>
            ))}
            <p style={{ textAlign: "center", marginTop: 14, fontSize: 8, color: tS, fontFamily: "'DM Mono',monospace" }}>v3.0 · {TOTAL} stickers · 48 teams · Panini WC2026</p>
          </div>
        )}
      </div>

      {/* PREMIUM */}
      {showPrem && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fi 0.3s" }} onClick={() => setShowPrem(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 320, borderRadius: 14, background: dk ? "#111118" : "#FFF", border: `1px solid ${A}25`, padding: 22 }}>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 36 }}>⭐</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, marginTop: 4, color: A }}>{t.prem.title}</h2>
              <p style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Playfair Display',serif", marginTop: 2 }}>{t.prem.price}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
              {t.prem.feats.map(f => (<div key={f} style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ color: A, fontSize: 11 }}>✓</span><span style={{ fontSize: 11 }}>{f}</span></div>))}
            </div>
            <button style={{ width: "100%", padding: 11, borderRadius: 9, background: `linear-gradient(135deg,${A},#E8D5A3)`, border: "none", color: "#07070E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Mono',monospace", letterSpacing: 2 }}>{t.prem.sub.toUpperCase()}</button>
            <button onClick={() => setShowPrem(false)} style={{ width: "100%", padding: 7, background: "transparent", border: "none", color: tS, fontSize: 10, cursor: "pointer", marginTop: 5 }}>{t.prem.close}</button>
          </div>
        </div>
      )}

      {/* TAB BAR */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: `${bg}F5`, backdropFilter: "blur(16px)", borderTop: `1px solid ${brd}`, display: "flex", padding: "5px 8px 8px", zIndex: 99 }}>
        {[{ k: "col", i: "📖" }, { k: "mkt", i: "🔄" }, { k: "stats", i: "📊" }, { k: "cfg", i: "⚙️" }].map(tb => (
          <button key={tb.k} onClick={() => setTab(tb.k)} style={{ flex: 1, padding: "5px 2px", borderRadius: 7, background: tab === tb.k ? `${A}10` : "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 15, filter: tab === tb.k ? "none" : "grayscale(1) opacity(0.35)" }}>{tb.i}</span>
            <span style={{ fontSize: 7, fontFamily: "'DM Mono',monospace", color: tab === tb.k ? A : tS, letterSpacing: 1, fontWeight: tab === tb.k ? 700 : 400 }}>{t.tabs[tb.k]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
