<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<div align="center">
  <img width="1200" height="475" alt="AI Student Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  
  <h1>🚀 AI Student Platform</h1>
  <p><strong>The ultimate AI-driven educational ecosystem for modern learners.</strong></p>
  
  [![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
  [![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
  [![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
</div>

---

## 🌟 Overview

**AI Student** is a comprehensive SaaS platform designed to revolutionize the learning experience. It integrates state-of-the-art AI models (Gemini & OpenAI) to provide students with a personal tutor, automated study tools, cognitive assessments, and a powerful AI agent studio.

Whether you're writing an essay, solving complex math problems, or building custom AI agents for automated tasks, AI Student provides the premium tools you need to excel.

## ✨ Key Features

### 🧠 Cortex Studio (AI Agent Builder)
- **Agent Builder**: Create custom AI agents with specific personas and goals.
- **Task Scheduler**: Automate background tasks using intelligent agents.
- **Real-time Notifications**: Get reminders and updates directly in your browser.
- **Agent Chat**: Direct interaction with your custom-built AI workforce.

### 🧪 NeuroTest AI
- **Cognitive Assessments**: Dynamic testing for pattern recognition, decision speed, and more.
- **AI-Generated Tests**: Real-time test generation using Gemini API.
- **Detailed Analytics**: Track your cognitive performance over time with visual charts.

### 🎓 AI Learning Suite
- **AI Tutor**: Personalized 1-on-1 tutoring on any subject.
- **Smart Study Mode**: High-efficiency focus tools for optimized learning.
- **AI Essay Writer & Flashcards**: Automate the tedious parts of studying.
- **Diagram & Slide Generator**: Visualize concepts instantly with Mermaid and AI.
- **Video Summarizer**: Get the gist of educational videos in seconds.
- **Chat with PDF**: Interact with your study materials using OCR and AI.

### 💼 Career & Productivity
- **Career Roadmap Generator**: AI-driven paths for your professional future.
- **ZenPath AI**: Mental wellness and balanced study tracking.
- **Smart Resources**: Curated learning materials tailored to your progress.

### 🌍 Localization
- **Multi-language Support**: Fully localized in English and Bengali (BN).
- **Dynamic Context**: Switch languages seamlessly across the entire dashboard.

### 🛡️ Admin & Infrastructure
- **Admin Dashboard**: Manage user access, approvals, and system health.
- **Secure Authentication**: Powered by Firebase Auth.
- **Multi-Gateway Payments**: Seamless subscriptions via Stripe and SSLCommerz.
- **Streaming Responses**: Real-time AI chat experience using Server-Sent Events (SSE).
- **Automated Tasks**: Background task execution using `node-cron` and AI agents.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend**: [Express](https://expressjs.com/), [Node.js](https://nodejs.org/)
- **Database/Auth**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Admin SDK)
- **AI Engines**: Google Gemini Pro, OpenAI GPT-4
- **Styling**: [Framer Motion](https://www.framer.com/motion/), [Lucide React Icons](https://lucide.dev/)
- **Payments**: Stripe, SSLCommerz
- **Tools**: node-cron, nodemailer, Tesseract.js, pdfjs-dist, Recharts

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Firebase Project
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AsifIkbal1/AI-student.git
   cd AI-student
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory and add the following:
   ```env
   # AI Configuration
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Payments
   STRIPE_SECRET_KEY=your_stripe_secret
   SSLCOMMERZ_STORE_ID=your_store_id
   SSLCOMMERZ_STORE_PASSWORD=your_password
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173` (Frontend) and `http://localhost:3000` (Backend).*

## 📁 Project Structure

```text
├── src/
│   ├── components/       # UI Components & Feature Modules
│   │   ├── CortexStudio/ # AI Agent Studio
│   │   ├── NeuroTest/    # Cognitive Assessments
│   ├── context/          # Auth, Theme, and Language Contexts
│   ├── locales/          # Localization (i18n)
│   ├── styles/           # Global styles and Tailwind config
│   └── main.tsx          # Application Entry point
├── server.ts             # Express Backend & API Endpoints
├── public/               # Static Assets
└── firebase.rules        # Security rules for Firestore/Storage
```

## 📄 License

This project is private and proprietary. All rights reserved.

---

<div align="center">
  <p>Built with ❤️ for the future of education.</p>
</div>
