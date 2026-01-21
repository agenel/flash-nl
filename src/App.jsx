import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './components/Card';
import LoginScreen from './components/LoginScreen';
import StatsModal from './components/StatsModal';
import { GameEngine } from './utils/GameEngine';
import { UserManager } from './utils/UserManager';

// Initialize Global Manager
const userManager = new UserManager();

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [vocabDetails, setVocabDetails] = useState([]);
  const [engine, setEngine] = useState(null);

  const [currentItem, setCurrentItem] = useState(null);
  const [stats, setStats] = useState({ total: 0, learned: 0, needsReview: 0 });
  const [flashMessage, setFlashMessage] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load Vocabulary on Mount
  useEffect(() => {
    userManager.getVocabulary().then(data => {
      setVocabDetails(data);
      setIsLoading(false);
    });
  }, []);

  // When user logs in, init engine
  const handleLogin = (user) => {
    try {
      // User is already authenticated by LoginScreen
      setCurrentUser(user);

      // Init Engine with fetched User Data
      const newEngine = new GameEngine(
        vocabDetails,
        user.progress,
        user.wordBank,
        (changedItemId, newLevel, newWordBankStatus) => {
          // OPTIMIZED SAVE CALLBACK
          // We only send the SINGLE item change to the API
          userManager.saveProgress(user.id, [{
            vocabId: changedItemId,
            level: newLevel,
            inWordBank: newWordBankStatus
          }]);

          // Update local stats immediately
          // (Engine state is already mutated)
        }
      );
      setEngine(newEngine);
      setStats(newEngine.getStats());
      loadNextItem(newEngine);

    } catch (err) {
      console.error("Error initializing engine:", err);
      alert("Something went wrong loading your profile.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEngine(null);
    setCurrentItem(null);
    setShowStats(false);
  };

  const loadNextItem = (eng) => {
    const item = eng.getNextItem();
    setCurrentItem(item);
  };

  const updateStats = () => {
    if (engine) setStats(engine.getStats());
  };

  const handleResult = (success) => {
    if (!engine || !currentItem) return;

    const cardId = currentItem.data.id;

    engine.processResult(cardId, success);
    updateStats();

    const msg = success ? 'Goed gedaan!' : 'Volgende keer beter!';
    setFlashMessage(msg);
    setTimeout(() => setFlashMessage(null), 1500);

    loadNextItem(engine);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">Loading Content...</div>;
  }

  if (!currentUser) {
    return <LoginScreen userManager={userManager} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col items-center p-4 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-dutch-orange/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-dutch-blue/20 rounded-full blur-3xl"></div>
      </div>

      <header className="w-full max-w-4xl flex justify-between items-center py-6 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-dutch-orange to-white bg-clip-text text-transparent">FlashNL</h1>
          <span className="text-gray-400 text-sm border-l border-white/20 pl-4">Hi, {currentUser.username}</span>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowStats(true)}
            className="flex gap-4 text-sm font-medium text-gray-400 bg-card-bg/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md hover:bg-card-bg transition-colors"
            title="Click to view details"
          >
            <span title="Learned Words">🎓 <span className="text-green-400">{stats.learned}</span>/{stats.total}</span>
            <span title="Word Bank (Needs Review)">🏦 <span className="text-orange-400">{stats.needsReview}</span></span>
          </button>
          <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300">Logout</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg z-10 relative">
        <AnimatePresence mode='wait'>
          {currentItem ? (
            <motion.div
              key={currentItem.data.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full flex justify-center"
            >
              <Card data={currentItem.data} onResult={handleResult} />
            </motion.div>
          ) : (
            <div className="text-center p-8 bg-card-bg rounded-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-4">Session Complete!</h2>
              <p className="text-gray-400">You have reviewed all due cards.</p>
              <button
                onClick={() => handleLogout()}
                className="mt-6 px-6 py-2 bg-dutch-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                Switch User
              </button>
            </div>
          )}
        </AnimatePresence>

        {/* Feedback Messages */}
        <AnimatePresence>
          {flashMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`absolute bottom-20 px-6 py-2 rounded-full font-bold shadow-lg ${flashMessage.includes('Goed') ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}
            >
              {flashMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Stats Modal */}
      <AnimatePresence>
        {showStats && engine && (
          <StatsModal lists={engine.getLists()} onClose={() => setShowStats(false)} />
        )}
      </AnimatePresence>

      <footer className="py-6 text-xs text-gray-500 z-10">
        FlashNL - A2 Dutch Learning
      </footer>
    </div>
  )
}

export default App
