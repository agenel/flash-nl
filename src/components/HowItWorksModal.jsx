import { motion } from 'framer-motion';
import { X, BookOpen, Brain, RotateCw, CheckCircle } from 'lucide-react';

export default function HowItWorksModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-card-bg border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="text-dutch-orange" />
                        How FlashNL Works
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-gray-400 hover:text-white" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">

                    {/* Section 1: The Hybrid System */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">1. Active Recall</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Unlike standard flashcards, you can't just flip immediately. You must
                                <span className="text-white font-bold"> answer a multiple-choice question</span> first.
                                This forces your brain to actively retrieve the meaning, which strengthens memory.
                            </p>
                        </div>
                    </div>

                    {/* Section 2: Spaced Repetition */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-dutch-orange/20 text-dutch-orange flex items-center justify-center">
                            <RotateCw size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">2. The Word Bank</h3>
                            <p className="text-gray-400 leading-relaxed">
                                If you get a question wrong, the card is sent to your
                                <span className="text-dutch-orange font-bold"> Word Bank</span>.
                                These high-priority words will reappear frequently until you master them.
                            </p>
                        </div>
                    </div>

                    {/* Section 3: Progression */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">3. Mastery</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Every correct answer increases a word's level (1-5). Higher-level words appear less often,
                                allowing you to focus on new or difficult vocabulary.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/5 text-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-dutch-orange hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-dutch-orange/20"
                    >
                        Got it, let's learn!
                    </button>
                </div>

            </motion.div>
        </div>
    );
}
