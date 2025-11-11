# PyroNotes - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies
```bash
cd pyronotes
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to `http://localhost:5173`

## 📖 User Guide

### Landing Page Overview

The landing page is divided into two main sections:

#### Left Panel: Recording Module
1. **Start Recording**: Click "Start Recording" to begin capturing audio
   - Timer and audio level meter will appear
   - Transcription appears in real-time in the "Live Transcript" tab
   - AI-organized content appears in the "AI Organized" tab
2. **Upload Audio**: Click "Upload Audio" to process existing audio files
3. **Stop Recording**: Click "Stop Recording" when done
4. **Generate Materials**: After stopping, a modal appears to generate:
   - Study Notes
   - Flashcards  
   - Quiz

#### Right Panel: Lectures Library
1. **View All Lectures**: Shows all recorded/uploaded lectures
2. **Search**: Use the search bar to filter lectures by title
3. **Folders**: 
   - Click folders in the sidebar to filter by folder
   - Create new folders with the "+" button
   - Add lectures to folders using the folder icon on each lecture
4. **Generate from Folder**: When a folder is selected, click "Generate from Folder" to create study materials from all lectures in that folder
5. **Lecture Actions**:
   - 💡 Generate study materials for individual lecture
   - 📁 Add to folder
   - 🗑️ Delete lecture

### Theme Toggle
Click the sun/moon icon in the header to switch between light and dark modes.

### Sign Up
Click "Sign Up" in the header to create an account (currently a mock flow).

## 🎨 Design Features

### Color Scheme
- **Light Mode**: Subtle amber/orange gradients on white backgrounds
- **Dark Mode**: Fire accents on true black backgrounds
- **Gradients**: Used sparingly for primary actions and branding

### Responsive Design
- **Mobile**: Stacked layout with collapsible folder sidebar
- **Tablet**: Side-by-side with adjusted spacing
- **Desktop**: Full two-column layout with optimal spacing

### Accessibility
- All buttons and controls are keyboard accessible
- Focus states are clearly visible
- Screen readers can navigate and understand the content
- ARIA live regions announce transcription updates

## 🛠️ Development Tips

### Mock Data
The app includes mock lectures and folders for demonstration:
- 4 sample lectures across 3 folders
- Mock transcription streaming
- Mock generation results

### Hot Module Replacement
Changes to source files automatically reload in the browser.

### Component Structure
- **Contexts** provide global state (Theme, Transcription, Library)
- **Features** are self-contained modules
- **Components** are shared UI elements

### Building for Production
```bash
npm run build
```
Output will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## 🔌 Backend Integration Guide

### Step 1: Update API Service
Edit `src/services/api.ts` and replace mock implementations with real API calls.

### Step 2: WebSocket for Transcription
Replace the `subscribeToTranscription` stub with:
```typescript
subscribeToTranscription(id: string, onEvent: (event: StreamEvent) => void) {
  const ws = new WebSocket(`wss://your-api.com/transcriptions/${id}/stream`);
  ws.onmessage = (msg) => onEvent(JSON.parse(msg.data));
  return () => ws.close();
}
```

### Step 3: Authentication
Add token management:
```typescript
// After successful sign up/in, store token
localStorage.setItem('auth-token', token);

// Add to API requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
}
```

### Step 4: Environment Variables
Create `.env` file:
```
VITE_API_URL=https://your-api.com
VITE_WS_URL=wss://your-api.com
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 3000
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Dark Mode Flicker
The inline script in `index.html` prevents this by setting the theme class before React loads.

## 📝 Next Steps

1. **Customize**: Adjust colors in `tailwind.config.js`
2. **Add Features**: Build new components in `src/features/`
3. **Backend**: Connect to your API endpoints
4. **Deploy**: Build and deploy to Vercel, Netlify, or similar

## 💡 Pro Tips

- Use the browser dev tools to inspect component state
- Check the Network tab to see API stub calls
- Mock data is defined in `src/contexts/LibraryContext.tsx`
- Transcription simulation is in `src/contexts/TranscriptionContext.tsx`

Happy coding! 🔥

