import React, { useState } from 'react';
import { askQuestion } from '../api';

const QuizSection = ({ books }) => {
    const [selectedBook, setSelectedBook] = useState('');
    const [questionData, setQuestionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleGenerate = async () => {
        if (!selectedBook) return;
        setLoading(true);
        setQuestionData(null);
        setFeedback(null);
        try {
            const data = await askQuestion(selectedBook);
            setQuestionData(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const checkAnswer = (option) => {
        if (option === questionData.answer) {
            setFeedback('Correct! 🎉');
        } else {
            setFeedback(`Incorrect. The correct answer was: ${questionData.answer}`);
        }
    };

    return (
        <div className="glass-card max-w-2xl mx-auto mt-10 animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Knowledge Check
            </h2>

            <div className="flex gap-4 mb-8">
                <select
                    className="input-field flex-1 text-black"
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                >
                    <option value="">Select a Book...</option>
                    {books.map(b => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                </select>
                <button
                    onClick={handleGenerate}
                    disabled={!selectedBook || loading}
                    className="btn-primary"
                >
                    {loading ? 'Thinking...' : 'Ask Me!'}
                </button>
            </div>

            {questionData && (
                <div className="animate-slide-up space-y-6">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h3 className="text-xl font-semibold mb-4">{questionData.question}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {questionData.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => checkAnswer(opt)}
                                    className="p-3 text-left bg-white/5 hover:bg-indigo-600/50 border border-white/10 rounded-lg transition-all"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    {feedback && (
                        <div className={`p-4 rounded-lg text-center font-bold text-lg ${feedback.includes('Correct') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {feedback}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuizSection;
