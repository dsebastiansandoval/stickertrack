# StickerTrack ⚽ — World Cup 2026 Sticker Tracker

PWA para rastrear tu colección del álbum Panini del Mundial 2026.

## 🚀 Despliegue rápido en Vercel (5 minutos)

### Opción A: Desde GitHub (recomendado)

1. **Sube el proyecto a GitHub:**
   ```bash
   cd stickertrack
   git init
   git add .
   git commit -m "StickerTrack v3 — PWA Mundial 2026"
   gh repo create stickertrack --public --push
   # O créalo manualmente en github.com y haz push
   ```

2. **Despliega en Vercel:**
   - Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
   - Click "New Project" → Importa tu repo `stickertrack`
   - Framework: Next.js (auto-detectado)
   - Click "Deploy" — ¡listo!

3. **Tu app estará en:** `https://stickertrack.vercel.app` (o el nombre que elijas)

### Opción B: Desde la CLI de Vercel

```bash
npm install -g vercel
cd stickertrack
npm install
vercel
# Sigue las instrucciones, elige Next.js
```

## 📱 Instalar como PWA

Una vez desplegada:
- **Android:** Abre la URL en Chrome → menú ⋮ → "Agregar a pantalla de inicio"
- **iOS:** Abre en Safari → botón compartir → "Agregar a pantalla de inicio"
- **Desktop:** Chrome mostrará un ícono de instalación en la barra de URL

## 🔧 Desarrollo local

```bash
npm install
npm run dev
# Abre http://localhost:3000
```

## 📦 Stack técnico

- **Frontend:** Next.js 14 + React 18
- **Hosting:** Vercel (gratis)
- **Persistencia:** localStorage (offline-first)
- **PWA:** manifest.json + service worker
- **i18n:** ES/EN/FR/PT incluidos

## 🔜 Próximos pasos

1. Conectar Supabase para auth + marketplace real
2. Integrar Google AdSense en los slots de promo
3. Implementar pagos con Stripe para Premium
4. Sistema de notificaciones push

## 📊 Datos del álbum

- 980 stickers (48 equipos × 20 + 20 intro)
- 7 stickers por sobre
- Códigos reales: MEX1-20, BRA1-20, ARG1-20, etc.
- 12 stickers exclusivos Coca-Cola
- 68 stickers especiales (foil)

## 📄 Licencia

MIT — Uso libre. No afiliado con Panini ni FIFA.
