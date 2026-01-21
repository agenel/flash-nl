import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export default function StatsModal({ lists, onClose }) {
    const [activeTab, setActiveTab] = useState('learned'); // 'learned' or 'bank'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-bg/90 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-card-bg border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <h2 className="text-2xl font-bold text-white">Your Progress</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-4 gap-4">
                    <button
                        onClick={() => setActiveTab('learned')}
                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'learned'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <CheckCircle size={20} />
                        Learned ({lists.learned.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('bank')}
                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'bank'
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <AlertCircle size={20} />
                        Word Bank ({lists.wordBank.length})
                    </button>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar">
                    {activeTab === 'learned' ? (
                        <div className="space-y-3">
                            {lists.learned.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No words learned yet. Keep playing!</p>
                            )}
                            {lists.learned.map(item => (
                                <div key={item.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{item.dutch}</h3>
                                        <p className="text-gray-400 text-sm">{item.english}</p>
                                    </div>
                                    <span className="text-xs uppercase tracking-wider font-semibold text-gray-500 bg-black/30 px-2 py-1 rounded">{item.category}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {lists.wordBank.length === 0 && (
                                <p className="text-center text-gray-500 py-8">Great job! Your word bank is empty.</p>
                            )}
                            {lists.wordBank.map(item => (
                                <div key={item.id} className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{item.dutch}</h3>
                                        <p className="text-gray-400 text-sm">{item.english}</p>
                                    </div>
                                    <div className="bg-red-500/20 p-2 rounded-full text-red-500">
                                        <AlertCircle size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </motion.div>
        </div>
    );
}
