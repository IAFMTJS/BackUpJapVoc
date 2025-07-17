# Japanese Learning Platform Design System

Een uitgebreid design system voor een gamified Japans leerplatform met warme, uitnodigende esthetiek geïnspireerd op Japanse cultuur.

## 🎨 Visuele Stijl

### Kleurensysteem

#### Light Theme (Primair)
- **Hoofdachtergrond**: `#FAF0E6` - Warme beige tint
- **Kaartachtergrond**: `#F5F0E8` - Iets donkerdere beige
- **Hover states**: `#F0E8D8` - Nog donkerder voor interactie

#### Japanese Cultural Colors
- **Primaire acties**: `#D45A38` - Japanse rode tint
- **Hover states**: `#E67A5A` - Lichtere rode tint
- **Torii poort rood**: `#C44536` - Traditioneel torii rood
- **Hout bruin**: `#8B4513` - Houten bruin

#### Aardetinten
- **Licht tan**: `#D2B48C`
- **Rosy brown**: `#BC8F8F`
- **Donker tan**: `#8B7355`

#### Tekstkleuren
- **Primaire tekst**: `#2D2D2D` - Donkergrijs
- **Secundaire tekst**: `#5A5A5A` - Middelgrijs
- **Gedempte tekst**: `#8A8A8A` - Lichtgrijs

### Typografie

#### Font Families
- **Primair**: Inter (sans-serif)
- **Display**: Nunito (voor headings)
- **Japans**: Noto Sans JP, Noto Serif JP

#### Typography Scale
```typescript
// Display styles
display: {
  large: '4.5rem',    // 72px
  medium: '3.75rem',  // 60px
  small: '3rem',      // 48px
}

// Heading styles
heading: {
  h1: '2.25rem',      // 36px
  h2: '1.875rem',     // 30px
  h3: '1.5rem',       // 24px
  h4: '1.25rem',      // 20px
  h5: '1.125rem',     // 18px
  h6: '1rem',         // 16px
}

// Body text
body: {
  large: '1.125rem',  // 18px
  medium: '1rem',     // 16px
  small: '0.875rem',  // 14px
}
```

### Spacing

#### Base Spacing (4px grid)
- `0.5`: 2px
- `1`: 4px
- `2`: 8px
- `3`: 12px
- `4`: 16px
- `6`: 24px
- `8`: 32px
- `12`: 48px
- `16`: 64px

#### Component Spacing
```typescript
button: {
  small: '0.5rem 1rem',      // 8px 16px
  medium: '0.75rem 1.5rem',  // 12px 24px
  large: '1rem 2rem',        // 16px 32px
}

card: {
  small: '1rem',             // 16px
  medium: '1.5rem',          // 24px
  large: '2rem',             // 32px
}
```

### Border Radius

#### Component Radius
- **Primaire knoppen**: `0.75rem` (12px)
- **Kaarten**: `0.75rem` (12px)
- **Inputs**: `0.375rem` (6px)
- **Navigatie**: `0.5rem` (8px)

### Shadows

#### Component Shadows
```typescript
button: {
  default: '0 4px 6px -1px rgba(212, 90, 56, 0.2)',
  hover: '0 10px 15px -3px rgba(212, 90, 56, 0.2)',
}

card: {
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
}
```

## 🦸‍♂️ Mascottes en Illustraties

### Maneki Neko (Motivational Cat)
- **Doel**: Motivatie en kracht uitstralen
- **Gebruik**: Beloningen, upgrades, vooruitgang
- **Context**: "Level up!" schermen, motivaties, power-ups

### Sensei Penguin (Disciplined Learner)
- **Doel**: Discipline en focus symboliseren
- **Gebruik**: Lesmodules, uitleg, structuur
- **Context**: "Goed gedaan", "Let hierop", feedback

### Illustratiestijl
- **Cartoonesk** met duidelijke contourlijnen
- **Zachte pastel-schaduwen**
- **Licht retro-aanvoelend**
- **Handgetekend uitstraling**
- **Geen 3D of fotorealisme**

## 🧩 UI Componenten

### Button Component
```tsx
import Button from '../components/ui/Button';

<Button 
  variant="primary" 
  size="medium" 
  onClick={handleClick}
>
  Resume Course
</Button>
```

**Variants:**
- `primary`: Japanse rode achtergrond met witte tekst
- `secondary`: Beige achtergrond met donkere tekst

**Sizes:**
- `small`: 8px 16px padding
- `medium`: 12px 24px padding
- `large`: 16px 32px padding

### Card Component
```tsx
import Card from '../components/ui/Card';

<Card variant="default" size="medium">
  <h3>Current Level</h3>
  <p>Level 3</p>
</Card>
```

**Variants:**
- `default`: Standaard kaart met subtiele schaduw
- `elevated`: Verhoogde kaart met sterke schaduw

### JapaneseWelcome Component
```tsx
import JapaneseWelcome from '../components/ui/JapaneseWelcome';

<JapaneseWelcome
  userName="John"
  currentLevel={3}
  dailyGoal={20}
  dailyProgress={15}
  onResumeCourse={handleResume}
  onLogOut={handleLogout}
/>
```

## 🎯 Toepassingen

### Onboarding Flow
- Gebruik warme beige achtergronden
- Integreer mascottes voor motivatie
- Toon Torii poort elementen voor Japanse sfeer

### Dashboard
- Kaarten met afgeronde hoeken
- Progressiebalken in oranje tinten
- Mascottes voor verschillende secties

### Lesmodules
- Sensei Penguin voor uitleg
- Maneki Neko voor beloningen
- Japanse culturele elementen als accenten

### Beloningsschermen
- Maneki Neko in feestelijke poses
- Gouden accenten voor achievements
- Confetti animaties in Japanse kleuren

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px
- **Tablet**: 768px
- **Desktop**: 1024px
- **Wide**: 1280px
- **Ultra**: 1536px

### Mobile-first Approach
- Kleinere border radius op mobile
- Aangepaste spacing voor touch targets
- Vereenvoudigde animaties

## 🎨 Animaties

### Framer Motion Integratie
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
>
  Content
</motion.div>
```

### Custom Animations
- `fade-in`: Zachte fade-in animatie
- `slide-up`: Omhoog schuivende animatie
- `bounce-soft`: Zachte bounce voor mascottes

## 🔧 Implementatie

### Design System Importeren
```tsx
import { colors, typography, spacing, shadows, borderRadius } from '../design-system';
```

### Theme Context Gebruiken
```tsx
import { useTheme } from '../context/ThemeContext';

const { getThemeClasses } = useTheme();
const themeClasses = getThemeClasses();
```

### Tailwind Classes
```tsx
// Kleuren
className="bg-light text-text-primary"

// Typography
className="font-display text-2xl font-bold"

// Spacing
className="p-6 m-4"

// Shadows
className="shadow-card hover:shadow-hover"

// Border Radius
className="rounded-button"
```

## 🚀 Best Practices

### Consistentie
- Gebruik altijd de design system tokens
- Houd je aan de spacing grid
- Gebruik consistente border radius

### Toegankelijkheid
- Voldoende contrast ratio's
- Focus states voor alle interactieve elementen
- Screen reader vriendelijke labels

### Performance
- Lazy load illustraties
- Optimaliseer animaties
- Gebruik CSS-in-JS spaarzaam

## 📚 Documentatie Updates

Dit design system wordt continu bijgewerkt. Voor de laatste versie, zie:
- `src/design-system/colors.ts`
- `src/design-system/typography.ts`
- `src/design-system/spacing.ts`
- `src/design-system/shadows.ts`
- `src/design-system/borderRadius.ts` 