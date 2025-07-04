# 🧩 Sudoku - Farcaster Mini App

A fully-featured Sudoku puzzle game built as a Farcaster Mini App with multiple difficulty levels, social sharing, and leaderboards.

![Sudoku Mini App](https://img.shields.io/badge/Farcaster-Mini%20App-8b5cf6) ![Version](https://img.shields.io/badge/Version-1.0.0-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

### 🎮 Game Features
- **Multiple Difficulty Levels**: Easy, Medium, and Hard puzzles
- **Smart Puzzle Generation**: Unique puzzles with guaranteed solutions
- **Hint System**: Get helpful hints when stuck (limited per game)
- **Mistake Tracking**: Visual feedback for errors with a 3-mistake limit
- **Timer & Scoring**: Track your time and earn points based on performance
- **Keyboard Support**: Full keyboard navigation and input
- **Auto-Save**: Game state is preserved across sessions

### 🔗 Farcaster Integration
- **User Authentication**: Seamless integration with Farcaster user context
- **Social Sharing**: Share scores and victories directly to Farcaster
- **Haptic Feedback**: Native-like tactile responses
- **User Profile Display**: Shows Farcaster username and avatar
- **Native UI Integration**: Optimized for Farcaster client experience

### 📱 Mobile-First Design
- **Responsive Layout**: Works perfectly on all screen sizes
- **Touch-Optimized**: Large touch targets and gesture support
- **PWA Support**: Install as a native app on mobile devices
- **Dark Mode**: Automatic dark/light theme based on system preference
- **Accessibility**: Full keyboard navigation and screen reader support

### 🏆 Social Features
- **Leaderboards**: Local high scores with player rankings
- **Achievement Sharing**: Celebrate victories with the community
- **Challenge Friends**: Share specific difficulty levels

## 🚀 Quick Start

### Prerequisites

- **Node.js 22.11.0+** (Required for Farcaster SDK compatibility)
- A modern web browser
- Basic knowledge of HTML, CSS, and JavaScript

### Installation

1. **Clone or download the files:**
   ```bash
   # Create a new directory
   mkdir sudoku-mini-app
   cd sudoku-mini-app
   
   # Copy all the provided files into this directory
   ```

2. **Serve the files locally:**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser:**
   ```
   http://localhost:8000
   ```

### File Structure

```
sudoku-mini-app/
├── index.html          # Main HTML file
├── styles.css          # Comprehensive styling
├── app.js              # Main application logic
├── sudoku-engine.js    # Sudoku game engine
├── manifest.json       # PWA manifest
└── README.md           # This file
```

## 🔧 Configuration

### Customizing Difficulty Levels

Edit the `difficultySettings` in `sudoku-engine.js`:

```javascript
this.difficultySettings = {
    easy: { clues: 45, maxEmptyCells: 36 },
    medium: { clues: 35, maxEmptyCells: 46 },
    hard: { clues: 25, maxEmptyCells: 56 },
    expert: { clues: 20, maxEmptyCells: 61 } // Add new difficulty
};
```

### Modifying Score Calculation

Adjust scoring in the `calculateScore` method:

```javascript
calculateScore(difficulty, timeInSeconds, mistakes) {
    const baseScores = {
        easy: 100,
        medium: 200,
        hard: 300,
        expert: 500 // New difficulty scoring
    };
    // ... rest of scoring logic
}
```

### Customizing UI Colors

Update CSS custom properties in `styles.css`:

```css
:root {
    --primary-color: #8b5cf6;      /* Purple theme */
    --success-color: #10b981;      /* Green for correct moves */
    --error-color: #ef4444;        /* Red for mistakes */
    --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 🌐 Deployment

### Option 1: GitHub Pages (Free)

1. **Create a GitHub repository**
2. **Upload your files to the repository**
3. **Enable GitHub Pages in Settings**
4. **Your app will be available at:** `https://username.github.io/repository-name`

### Option 2: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Your app will be deployed with a custom domain**

### Option 3: Netlify

1. **Drag and drop your folder** on [netlify.com/drop](https://netlify.com/drop)
2. **Get instant deployment** with a custom domain

### Option 4: Custom Server

Deploy to any web server that can serve static files:
- Apache
- Nginx  
- Express.js
- Any cloud provider (AWS S3, Google Cloud Storage, etc.)

## 📝 Publishing as a Farcaster Mini App

### Step 1: Deploy Your App

First, deploy your app using one of the methods above and get a public URL.

### Step 2: Update Meta Tags

In `index.html`, update the Farcaster meta tags with your actual domain:

```html
<meta property="fc:frame:image" content="https://your-domain.com/preview-image.png">
<meta property="fc:frame:button:1:target" content="https://your-domain.com">
```

### Step 3: Create Preview Image

Create a 1200x630px preview image showcasing your Sudoku game and save it as `preview-image.png`.

### Step 4: Register Your Mini App

1. **Visit the Farcaster Mini App Directory**
2. **Submit your app** with the deployed URL
3. **Fill out the required information:**
   - App name: "Sudoku"
   - Description: "Play Sudoku puzzles with multiple difficulty levels"
   - Category: "Games"
   - URL: Your deployed domain

### Step 5: Share and Promote

Once approved, share your Mini App:
- Post on Farcaster with your app URL
- Share in relevant channels
- Ask friends to try it out

## 🛠️ Advanced Customization

### Adding New Features

#### Custom Puzzle Patterns

Add themed puzzle layouts:

```javascript
// In sudoku-engine.js
generateThemedPuzzle(theme) {
    switch(theme) {
        case 'cross':
            return this.generateCrossPattern();
        case 'diamond':
            return this.generateDiamondPattern();
        default:
            return this.generatePuzzle();
    }
}
```

#### Multiplayer Support

Add real-time multiplayer features:

```javascript
// Add to app.js
class MultiplayerSudoku extends SudokuApp {
    async joinRoom(roomId) {
        // WebSocket connection for real-time play
    }
    
    syncMove(row, col, number) {
        // Sync moves with other players
    }
}
```

#### Tournament Mode

Create timed competitions:

```javascript
// Tournament mode with leaderboards
class TournamentMode {
    constructor(duration = 300) { // 5 minutes
        this.timeLimit = duration;
        this.competitors = [];
    }
    
    startTournament() {
        // Start simultaneous games
    }
}
```

### Performance Optimization

#### Lazy Loading

Implement lazy loading for better performance:

```javascript
// Lazy load heavy features
const loadLeaderboard = () => import('./leaderboard.js');
const loadAdvancedFeatures = () => import('./advanced-features.js');
```

#### Service Worker

Add offline support with a service worker:

```javascript
// sw.js
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
```

## 🧪 Testing

### Local Testing

Test your Mini App thoroughly before deployment:

1. **Different Screen Sizes:**
   ```bash
   # Test responsive design
   # Use browser dev tools to simulate different devices
   ```

2. **Touch Interactions:**
   - Test all buttons and grid interactions
   - Verify haptic feedback works
   - Check gesture support

3. **Game Logic:**
   - Test puzzle generation
   - Verify solution validation
   - Check hint system
   - Test score calculation

### Farcaster Integration Testing

1. **SDK Integration:**
   - Test user context loading
   - Verify ready() call works
   - Check sharing functionality

2. **Meta Tags:**
   - Validate OpenGraph tags
   - Test Frame preview
   - Verify social sharing

## 📊 Analytics & Monitoring

### Adding Analytics

Track user engagement:

```javascript
// Add to app.js
class Analytics {
    track(event, data) {
        // Send to your analytics service
        console.log('Analytics:', event, data);
    }
    
    trackGameStart(difficulty) {
        this.track('game_start', { difficulty });
    }
    
    trackGameComplete(score, time) {
        this.track('game_complete', { score, time });
    }
}
```

### Performance Monitoring

Monitor app performance:

```javascript
// Performance monitoring
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        console.log('Performance:', entry.name, entry.duration);
    }
});
observer.observe({ entryTypes: ['measure', 'navigation'] });
```

## 🔒 Security Considerations

### Input Validation

Always validate user input:

```javascript
// Validate moves
function validateMove(row, col, number) {
    if (row < 0 || row > 8) return false;
    if (col < 0 || col > 8) return false;
    if (number < 0 || number > 9) return false;
    return true;
}
```

### XSS Prevention

The app is designed to prevent XSS attacks by avoiding `innerHTML` and using safe DOM manipulation.

## 🤝 Contributing

Want to improve the Sudoku Mini App? Here's how:

1. **Fork the project**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- **Code Style:** Use ESLint and Prettier
- **Testing:** Test all new features thoroughly
- **Documentation:** Update README for new features
- **Performance:** Ensure changes don't impact performance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Farcaster Team** - For the amazing Mini App platform
- **Sudoku Community** - For inspiration and feedback
- **Open Source Contributors** - For various libraries and tools used

## 📞 Support

Need help? Here are your options:

- **Documentation:** Read this README thoroughly
- **Issues:** Open a GitHub issue for bugs
- **Community:** Join the Farcaster developer community
- **Email:** Contact the maintainer directly

## 🗺️ Roadmap

### Version 1.1 (Next Release)
- [ ] Daily challenges
- [ ] Achievement system
- [ ] Better animations
- [ ] Sound effects

### Version 1.2 (Future)
- [ ] Multiplayer mode
- [ ] Custom themes
- [ ] Advanced statistics
- [ ] Tournament mode

### Version 2.0 (Long-term)
- [ ] AI opponent
- [ ] AR integration
- [ ] Voice commands
- [ ] Advanced tutorials

---

**Built with ❤️ for the Farcaster community**

*Share your high scores and challenge your friends! 🎯* 