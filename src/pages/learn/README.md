# Japanese Learning Module

Een volledig afzonderlijke leermodule voor het leren van Japans, gebouwd met Next.js en Firebase.

## 🎯 Doel

Deze module biedt een gestructureerde leerervaring met:
- 40 thematisch opgebouwde levels (momenteel 5 volledig uitgewerkt)
- Verschillende oefeningstypen: meerkeuze, type-antwoord, geheugenspel, grammatica
- Score berekening en voortgang tracking
- Automatische level unlocking op basis van prestaties
- Firebase integratie voor gebruikersvoortgang

## 📁 Structuur

```
src/pages/learn/
├── index.tsx              # Hoofdpagina met alle levels
├── [levelId].tsx          # Individuele level pagina
└── README.md              # Deze documentatie

src/components/learn/
├── LearnLayout.tsx        # Eigen layout voor de module
├── ExerciseRenderer.tsx   # Dynamisch renderen van oefeningen
├── ScoreSummary.tsx       # Score en feedback weergave
└── LockOverlay.tsx        # Overlay voor gelockte levels

src/data/
└── levels.ts              # Alle level data en oefeningen

src/services/
└── learnService.ts        # Firebase service voor voortgang

src/types/
└── learn.ts               # TypeScript types

src/styles/
└── learn.module.css       # Module-specifieke styling
```

## 🔐 Firebase Integratie

### Database Structuur
```typescript
users/{uid}/learn/progress: {
  level_1: { 
    score: 92, 
    passed: true, 
    unlocked: true, 
    timestamp: ISOString,
    attempts: 1 
  },
  level_2: { ... },
  // etc.
}
```

### Services
- `learnService.getUserProgress()` - Laad gebruikersvoortgang
- `learnService.saveLevelResult()` - Sla level resultaat op
- `learnService.unlockNextLevels()` - Unlock volgende levels
- `learnService.subscribeToProgress()` - Real-time updates

## 🎮 Oefeningstypen

### 1. Multiple Choice
- Meerkeuzevragen met opties
- Automatische feedback
- Punten per correct antwoord

### 2. Type Answer
- Typ het juiste antwoord
- Hints beschikbaar
- Case-insensitive matching

### 3. Memory Game
- Onthoud sequenties
- Interactieve uitdaging
- Visuele feedback

### 4. Grammar Fill
- Vul grammatica aan
- Contextuele hints
- Grammatica validatie

### 5. Audio Listen (Gepland)
- Luister naar audio
- Kies juiste antwoord
- Uitspraak oefening

## 📊 Score Systeem

### Berekening
```typescript
score = (correctAnswers / totalQuestions) * 100
passed = score >= level.minScore
```

### Feedback Levels
- 90%+ : "Excellent! You're a natural!"
- 80%+ : "Great job! You're making excellent progress!"
- 70%+ : "Good work! Keep practicing to improve!"
- 60%+ : "Not bad! A bit more practice will help."
- <60% : "Keep practicing! You'll get better with time."

## 🎯 Level Unlocking

### Regels
1. Level 1 is altijd unlocked
2. Volgende levels unlocken na het halen van vereiste levels
3. Minimum score vereist per level (70-80%)
4. Automatische unlocking na succesvolle voltooiing

### Voorbeeld
```typescript
Level 1 → Level 2 (na 70% score)
Level 2 → Level 3 (na 75% score)
Level 3 → Level 4 (na 80% score)
Level 4 → Level 5 (na 75% score)
```

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Tablet en desktop optimalisatie
- Touch-friendly interfaces

### Visuele Feedback
- Progress bars
- Star ratings
- Color-coded categories
- Animaties en transities

### Accessibility
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators

## 🚀 Gebruik

### Navigatie
```typescript
// Ga naar level overzicht
navigate('/learn')

// Ga naar specifiek level
navigate('/learn/1')
```

### Component Gebruik
```typescript
import { LearnLayout } from '../components/learn/LearnLayout';
import { ExerciseRenderer } from '../components/learn/ExerciseRenderer';

// In je component
<LearnLayout title="Level 1 - Hiragana Basics">
  <ExerciseRenderer 
    exercise={exercise}
    exerciseIndex={0}
    onComplete={handleComplete}
    onNext={handleNext}
  />
</LearnLayout>
```

## 🔧 Configuratie

### Nieuwe Level Toevoegen
1. Voeg level toe aan `src/data/levels.ts`
2. Definieer oefeningen en items
3. Stel unlocking regels in
4. Test de level

### Oefeningstype Uitbreiden
1. Voeg type toe aan `ExerciseType` in `src/types/learn.ts`
2. Implementeer renderer in `ExerciseRenderer.tsx`
3. Voeg styling toe aan CSS module

## 📈 Statistieken

### Gebruikersvoortgang
- Totaal voltooide levels
- Gemiddelde score
- Tijd besteed per level
- Pogingen per level

### Real-time Updates
- Firebase listeners
- Automatische synchronisatie
- Offline support (gepland)

## 🔮 Toekomstige Features

### Geplande Uitbreidingen
- [ ] Audio oefeningen
- [ ] Spraakherkenning
- [ ] Offline mode
- [ ] Social features
- [ ] Achievement system
- [ ] Leaderboards
- [ ] Custom levels
- [ ] Export/import voortgang

### Technische Verbeteringen
- [ ] Performance optimalisatie
- [ ] Caching strategieën
- [ ] Progressive Web App
- [ ] Analytics integratie
- [ ] A/B testing

## 🐛 Troubleshooting

### Veelvoorkomende Problemen

1. **Level niet unlocked**
   - Controleer of vorige levels zijn gehaald
   - Verifieer minimum score vereisten

2. **Firebase errors**
   - Controleer internetverbinding
   - Verifieer Firebase configuratie
   - Check console voor errors

3. **Styling issues**
   - Controleer Tailwind CSS classes
   - Verifieer CSS module imports
   - Test responsive breakpoints

## 📝 Development

### Setup
```bash
# Installeer dependencies
npm install

# Start development server
npm start

# Build voor productie
npm run build
```

### Testing
```bash
# Run tests
npm test

# Test specifieke component
npm test ExerciseRenderer
```

### Deployment
```bash
# Build en deploy
npm run build
firebase deploy
```

## 🤝 Bijdragen

1. Fork het project
2. Maak feature branch
3. Commit changes
4. Push naar branch
5. Open Pull Request

## 📄 Licentie

Dit project is onderdeel van de JapVoc applicatie. 