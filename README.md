# FlashNL

**FlashNL** is a modern, gamified web application designed to help English speakers learn Dutch at the A2 level. It utilizes a flashcard-based system with a premium, engaging user interface to make language learning effective and enjoyable.

##  Features

- **Gamified Learning**: Interactive flashcards with instant feedback.
- **A2 Vocabulary**: Curated list of essential Dutch words and phrases for A2 level learners.
- **Progress Tracking**: Track your learning journey (powered by local storage/database).
- **Premium UI/UX**: Built with a focus on aesthetics using TailwindCSS and Framer Motion for smooth animations.

##  Tech Stack

**Frontend:**
- [React](https://react.dev/) - UI Library
- [Vite](https://vitejs.dev/) - Build Tool
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Zustand](https://github.com/pmndrs/zustand) - State Management

**Backend:**
- [Node.js](https://nodejs.org/) - Runtime Environment
- [Express](https://expressjs.com/) - Web Framework
- [SQLite](https://www.sqlite.org/index.html) - Database

##  Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory.
2.  **Install dependencies**:

    ```bash
    npm install
    ```

### Running the Application

To run the full application, you need to start both the backend server and the frontend development server.

1.  **Start the Backend Server**:
    Open a terminal and run:
    ```bash
    node server/index.js
    ```
    *The server typically runs on port 3000.*

2.  **Start the Frontend**:
    Open a new terminal window and run:
    ```bash
    npm run dev
    ```
    *The frontend will be available at the URL provided by Vite (usually http://localhost:5173).*

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.