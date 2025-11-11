# PyroNotes 🔥

A modern, AI-powered lecture transcription and note-taking application with beautiful fire-themed UI.

![PyroNotes](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)
![Vite](https://img.shields.io/badge/Vite-7.2-646cff)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎙️ Recording & Transcription
- **Real-time audio recording** with visual feedback (timer and audio level meter)
- **Upload existing audio files** for transcription
- **Live transcription display** as you speak
- **AI-organized content** with automatic summarization updated periodically

### 📚 Study Materials Generation
After recording or uploading, instantly generate:
- **📝 Study Notes**: Comprehensive, organized notes with key concepts and summaries
- **🗂️ Flashcards**: Question and answer cards for active recall practice
- **✅ Quiz**: Multiple-choice questions to test understanding

### 📁 Library Management
- **Organize lectures into folders** for better organization
- **Search and filter** functionality to find lectures quickly
- **Quick actions** for each lecture (generate materials, add to folder, delete)
- **Bulk operations** - generate materials for entire folders at once

### 🎨 Modern UI/UX
- **Fire-themed design** with subtle yellow/orange gradients
- **Light and dark mode** with smooth transitions and persistence
- **Fully responsive** design (mobile, tablet, desktop)
- **Sticky header** with frosted glass effect
- **Accessible** with ARIA labels and keyboard navigation
- **Smooth animations** and visual feedback

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pyronotes.git
cd pyronotes

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📸 Screenshots

### Light Mode - Hero Section
Beautiful landing page with engaging hero section and clear call-to-action buttons.

### Dark Mode - Recording
Real-time transcription with AI-organized content tabs.

### Library Management
Organize your lectures with folders and powerful search functionality.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7.2
- **Styling**: Tailwind CSS 4.1 with custom fire-themed palette
- **Routing**: React Router v6
- **State Management**: React Context API
- **Icons**: Heroicons (inline SVG)

## 📁 Project Structure

```
pyronotes/
├── src/
│   ├── components/          # Shared components (Header, Hero, ThemeToggle)
│   ├── contexts/            # React contexts (Theme, Transcription, Library)
│   ├── features/            # Feature-based modules
│   │   ├── auth/           # Authentication (SignUp)
│   │   ├── generate/       # AI generation modals and panels
│   │   ├── library/        # Lectures library, folders, lists
│   │   └── recorder/       # Recording panel and transcription stream
│   ├── pages/              # Route pages (Landing)
│   ├── services/           # API service layer with typed stubs
│   ├── types.ts            # TypeScript type definitions
│   ├── App.tsx             # Main app with routing and providers
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind CSS with theme configuration
├── public/                 # Static assets
└── index.html             # HTML template with theme script
```

## 🔌 Backend Integration

The frontend is designed to make backend integration straightforward. All API calls are stubbed in `src/services/api.ts` with clear TypeScript interfaces.

### API Endpoints to Implement

**Transcription:**
- `POST /api/transcriptions` - Start transcription session
- `WS/SSE /api/transcriptions/:id/stream` - Stream transcription events
- `POST /api/transcriptions/:id/finalize` - Finalize session

**Generation:**
- `POST /api/generate` - Generate study materials (notes/flashcards/quiz)

**Library:**
- `GET /api/lectures` - Fetch all lectures
- `POST /api/lectures` - Create lecture
- `DELETE /api/lectures/:id` - Delete lecture

**Folders:**
- `GET /api/folders` - Fetch all folders
- `POST /api/folders` - Create folder
- `DELETE /api/folders/:id` - Delete folder

**Authentication:**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

See `src/services/api.ts` for detailed type definitions and expected request/response formats.

## 🎨 Customization

### Color Palette

The fire-themed color palette can be customized in `src/index.css`:

```css
@theme {
  --color-pyro-50: #fff7ed;
  --color-pyro-500: #f97316;  /* Primary color */
  --color-pyro-950: #431407;
}
```

### Gradients

```css
.bg-gradient-pyro {
  background-image: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
}
```

## ♿ Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus visible states
- Screen reader announcements for dynamic content
- Proper semantic HTML
- Color contrast meets WCAG AA standards

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Mock Data

The app includes mock data for demonstration:
- 4 sample lectures across 3 folders
- Mock transcription streaming simulation
- Mock generation results

Mock data is defined in `src/contexts/LibraryContext.tsx` and `src/contexts/TranscriptionContext.tsx`.

## 🚧 Roadmap

- [ ] Real backend API integration
- [ ] WebSocket implementation for real-time transcription
- [ ] Audio waveform visualization
- [ ] PWA support for offline recording
- [ ] Export notes as PDF/Markdown
- [ ] Spaced repetition algorithm for flashcards
- [ ] Lecture playback with transcript sync
- [ ] Collaborative folder sharing
- [ ] Multi-language support
- [ ] Analytics and insights dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons from [Heroicons](https://heroicons.com/)
- Built with [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI inspiration from modern SaaS applications

## 📧 Contact

Project Link: [https://github.com/yourusername/pyronotes](https://github.com/yourusername/pyronotes)

---

**Built with ❤️ and 🔥**
