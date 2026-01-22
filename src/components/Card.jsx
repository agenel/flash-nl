import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Check, X } from 'lucide-react';

export default function Card({ data, onResult }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

    // Reset state when data changes
    useEffect(() => {
        setIsFlipped(false);
        setSelectedOption(null);
        setIsCorrect(null);
    }, [data.id]);

    const handleOptionSelect = (optionId) => {
        if (selectedOption !== null) return; // Prevent multiple clicks

        setSelectedOption(optionId);
        const correct = optionId === data.quiz.answerId;
        setIsCorrect(correct);

        // Wait a brief moment to show selection, then flip
        setTimeout(() => {
            setIsFlipped(true);
            // We notify parent AFTER the user reviews the back of the card, usually via a "Next" button
            // But the requirements imply we just show the result.
            // Let's add a "Next" button on the back to actually proceed.
        }, 400);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        onResult(isCorrect);
    };

    return (
        <div className="perspective-1000 w-full max-w-md min-h-[420px] md:min-h-[500px]">
            <motion.div
                className="relative w-full h-full transition-all duration-700 transform-style-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front Face - Quiz Mode */}
                <div className="absolute w-full h-full backface-hidden bg-card-bg rounded-2xl shadow-xl border border-white/5 flex flex-col p-4 md:p-6">
                    <div className="flex-1 flex flex-col items-center justify-center text-center mb-6">
                        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{data.category}</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{data.dutch}</h2>
                        <p className="text-gray-500 text-sm">Select the correct meaning</p>
                    </div>

                    <div className="space-y-3 w-full">
                        {data.quiz.options.map(option => {
                            let btnClass = "bg-white/5 hover:bg-white/10 border-white/10";
                            if (selectedOption) {
                                if (option.id === data.quiz.answerId) btnClass = "bg-green-500/20 border-green-500 text-green-400";
                                else if (option.id === selectedOption) btnClass = "bg-red-500/20 border-red-500 text-red-400";
                                else btnClass = "opacity-30";
                            }

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionSelect(option.id)}
                                    className={`w-full p-3 md:p-4 rounded-xl border text-left transition-all font-medium ${btnClass}`}
                                    disabled={selectedOption !== null}
                                >
                                    {option.text}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Back Face - Result & Details */}
                <div className="absolute w-full h-full backface-hidden bg-card-bg rounded-2xl shadow-xl border border-white/5 flex flex-col items-center justify-center p-8 rotate-y-180">

                    {/* Result Header */}
                    <div className={`mb-6 p-3 rounded-full ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {isCorrect ? <Check size={32} /> : <X size={32} />}
                    </div>

                    <h3 className="text-3xl font-bold text-dutch-orange mb-1">{data.english}</h3>
                    <p className="text-sm text-gray-400 mb-6">{data.dutch}</p>

                    <div className="w-full h-px bg-white/10 mb-6"></div>

                    <div className="bg-black/20 p-4 rounded-xl w-full mb-8">
                        <p className="text-lg text-cream italic mb-2">"{data.sentence}"</p>
                        <p className="text-sm text-gray-300">{data.sentence_trans}</p>
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full py-4 bg-white text-dutch-blue font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        Continue
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
