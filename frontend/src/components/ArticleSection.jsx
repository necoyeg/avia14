import React, { useState } from 'react';
import { generateArticle } from '../api';
import ReactMarkdown from 'react-markdown';

const ArticleSection = ({ books }) => {
    const [selectedBook, setSelectedBook] = useState('');
    const [topic, setTopic] = useState('');
    const [article, setArticle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!selectedBook || !topic) return;
        setLoading(true);
        setArticle('');
        try {
            const data = await generateArticle(selectedBook, topic);
            setArticle(data.content);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="glass-card max-w-4xl mx-auto mt-10 animate-fade-in mb-20">
            <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-orange-400">
                AI Article Researcher
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <select
                    className="input-field text-black"
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                >
                    <option value="">Select Source Material...</option>
                    {books.map(b => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                </select>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Enter Topic (e.g. 'Chapter 1 Summary')"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
                <button
                    onClick={handleGenerate}
                    disabled={!selectedBook || !topic || loading}
                    className="btn-primary bg-pink-600 hover:bg-pink-500"
                >
                    {loading ? 'Writing Article...' : 'Generate Article'}
                </button>
            </div>

            {article && (
                <div className="bg-white/90 text-gray-900 p-8 rounded-lg shadow-2xl animate-slide-up prose lg:prose-xl max-w-none">
                    <ReactMarkdown>{article}</ReactMarkdown>
                </div>
            )}
        </div>
    );
};

export default ArticleSection;
