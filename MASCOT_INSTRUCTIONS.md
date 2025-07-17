# 🐾 Mascot Icons Implementation Guide

## 📁 Waar de Icons Plaatsen

### Aanbevolen Locatie: `public/assets/mascots/`

```
public/
└── assets/
    └── mascots/
        ├── Maneki Neko and penguin Light mode.PNG  ← Light theme versie
        └── Maneki Neko and penguin Dark mode.PNG   ← Dark theme versie
```

### Alternatieve Locatie: `src/assets/mascots/`

```
src/
└── assets/
    └── mascots/
        ├── Maneki Neko and penguin Light mode.PNG  ← Light theme versie
        └── Maneki Neko and penguin Dark mode.PNG   ← Dark theme versie
```

## 🎨 Icon Specificaties

### Gecombineerde Mascot Icon
- **Formaat**: PNG (zoals geplaatst)
- **Inhoud**: Maneki Neko + Penguin + Torii Gate in één icoon
- **Versies**: 
  - Light Mode versie voor beige achtergronden
  - Dark Mode versie voor donkere achtergronden
- **Stijl**: Handgetekend, cartoonachtig, professioneel

### Aanbevolen Eigenschappen
- **Resolutie**: 400x400px of hoger voor scherpe weergave
- **Achtergrond**: Transparant (PNG)
- **Kleuren**: 
  - Light Mode: Past bij beige thema (#FAF0E6 achtergrond)
  - Dark Mode: Past bij donkere thema (#1B1C22 achtergrond)
- **Compositie**: Maneki Neko links, Penguin rechts, Torii gate op achtergrond

## 🚀 Implementatie

### 1. Icons Geplaatst ✅
De icons zijn al geplaatst in `public/assets/mascots/`:
- `Maneki Neko and penguin Light mode.PNG`
- `Maneki Neko and penguin Dark mode.PNG`

### 2. Componenten Gebruiken

#### Mascots Component
```tsx
import Mascots from './components/ui/Mascots';

// Welcome variant
<Mascots variant="welcome" size="large" />

// Loading variant
<Mascots variant="loading" size="medium" />

// Achievement variant
<Mascots variant="achievement" size="large" />

// Error variant
<Mascots variant="error" size="medium" />
```

#### LoadingMascots Component
```tsx
import LoadingMascots from './components/ui/LoadingMascots';

// Loading state
<LoadingMascots type="loading" message="Laden..." />

// Processing state
<LoadingMascots type="processing" message="Verwerken..." />

// Achievement state
<LoadingMascots type="achievement" message="Gefeliciteerd!" />

// Thinking state
<LoadingMascots type="thinking" message="Denken..." />
```

### 3. Automatische Theme Switching
De componenten schakelen automatisch tussen light en dark mode:
- **Light Theme**: Toont "Maneki Neko and penguin Light mode.PNG"
- **Dark Theme**: Toont "Maneki Neko and penguin Dark mode.PNG"

### 4. Fallback Systeem
- Als de PNG bestanden niet laden, worden SVG fallbacks getoond
- De fallbacks passen zich automatisch aan aan het theme
- Geen breaking changes als icons ontbreken

## 🎯 Gebruik in Verschillende Contexten

### Welcome Screen
```tsx
<Mascots 
  variant="welcome"
  size="large"
  className="w-full h-full"
/>
```

### Loading States
```tsx
<LoadingMascots 
  type="loading"
  message="Laden van lessen..."
  size="medium"
/>
```

### Achievement Screens
```tsx
<LoadingMascots 
  type="achievement"
  message="Level voltooid!"
  size="large"
/>
```

### Error States
```tsx
<Mascots 
  variant="error"
  size="medium"
/>
```

## 🔧 Customization

### Custom Sizes
```tsx
// Kleine mascots (128x128px)
<Mascots size="small" />

// Medium mascots (192x192px) - default
<Mascots size="medium" />

// Grote mascots (256x256px)
<Mascots size="large" />
```

### Custom Animations
De componenten gebruiken automatisch de juiste animaties:
- **Welcome**: Fade-in animatie
- **Loading**: Zachte bounce animatie
- **Achievement**: Bounce animatie
- **Error**: Shake animatie

### Theme Integration
De mascots passen zich automatisch aan aan het theme:
- **Light Theme**: Toont light mode versie
- **Dark Theme**: Toont dark mode versie
- **Automatische switching**: Geen extra code nodig

## 📱 Responsive Behavior

### Mobile (< 768px)
- Mascots worden automatisch verkleind (`scale-75`)
- Touch-friendly sizing
- Optimized voor performance

### Tablet (768px - 1024px)
- Balanced sizing tussen mobile en desktop
- Maintained visual impact

### Desktop (> 1024px)
- Volledige grootte mascots (`scale-100`)
- Optimale visuele impact
- Drop shadow voor diepte

## 🎨 Styling Tips

### Voor PNG Icons
- Gebruik transparante achtergrond
- Export in hoge resolutie (400x400px+)
- Compress voor web optimalisatie
- Zorg voor consistente aspect ratio (1:1)
- Test op beide thema's voor goede contrast

### Performance Optimalisatie
- PNG bestanden zijn geoptimaliseerd voor web
- Automatische lazy loading
- Fallback systeem voor betrouwbaarheid

## 🔍 Testing

### Test Checklist
- [x] Icons laden correct in light theme
- [x] Icons laden correct in dark theme
- [x] Automatische theme switching werkt
- [x] Fallback SVGs werken als icons ontbreken
- [x] Responsive behavior werkt op alle schermgroottes
- [x] Animations werken smooth
- [x] Performance is goed (geen lag)

### Test Page
Gebruik de `MascotTest` component om alle features te testen:
```tsx
import MascotTest from './pages/MascotTest';
```

### Debug Tips
```tsx
// Check of icons laden
<img 
  src="/assets/mascots/Maneki Neko and penguin Light mode.PNG"
  onLoad={() => console.log('Light mode mascot loaded')}
  onError={(e) => console.log('Light mode mascot failed to load:', e)}
/>

<img 
  src="/assets/mascots/Maneki Neko and penguin Dark mode.PNG"
  onLoad={() => console.log('Dark mode mascot loaded')}
  onError={(e) => console.log('Dark mode mascot failed to load:', e)}
/>
```

## 🎉 Resultaat

Na het plaatsen van de gecombineerde icons krijg je:
- ✅ Professionele mascot integratie met Torii gate
- ✅ Automatische theme-aware switching
- ✅ Responsive design
- ✅ Fallback systeem
- ✅ Smooth animations
- ✅ Consistent design language
- ✅ Geoptimaliseerde performance

### Features
- **Gecombineerde Icons**: Maneki Neko + Penguin + Torii gate in één icoon
- **Theme Switching**: Automatische switching tussen light/dark versies
- **Flexible Sizing**: Small, medium, large opties
- **Multiple Variants**: Welcome, loading, achievement, error states
- **Responsive**: Werkt perfect op alle devices
- **Fallback**: SVG fallbacks als PNG niet laadt

De mascots zullen nu automatisch verschijnen in alle componenten en zich perfect aanpassen aan het gekozen theme! 🐱🐧⛩️ 