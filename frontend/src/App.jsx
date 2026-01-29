import React, { useState, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import QuizSection from './components/QuizSection';
import ArticleSection from './components/ArticleSection';
import { getBooks } from './api';

function App() {
  const [view, setView] = useState('home');
  const [books, setBooks] = useState([]);

  const refreshBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      console.error("Failed to load books", err);
    }
  };

  useEffect(() => {
    refreshBooks();
  }, []);

  const renderContent = () => {
    switch (view) {
      case 'upload':
        return <UploadSection onUploadSuccess={refreshBooks} books={books} />;
      case 'ask':
        return <QuizSection books={books} />;
      case 'article':
        return <ArticleSection books={books} />;
      default:
        return (
          <div className="text-center mt-20 animate-fade-in space-y-8">
            <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 drop-shadow-lg">
              LearnAI
            </h1>
            <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
              Your intelligent companion for mastering PDF content. Upload books, test your knowledge, and generate deep-dive articles instantly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12 px-4">
              <NavCard
                title="Upload Books"
                desc="Manage your library securely."
                icon="📚"
                onClick={() => setView('upload')}
              />
              <NavCard
                title="Ask Questions"
                desc="Test yourself with AI quizzes."
                icon="💡"
                onClick={() => setView('ask')}
              />
              <NavCard
                title="Write Article"
                desc="Generate professional content."
                icon="✍️"
                onClick={() => setView('article')}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Navigation Header */}
      <nav className="flex justify-between items-center p-4 max-w-7xl mx-auto glass-card mb-8">
        <div
          className="text-2xl font-bold cursor-pointer hover:text-indigo-300 transition-colors"
          onClick={() => setView('home')}
        >
          LearnAI
        </div>
        <div className="space-x-4">
          <button onClick={() => setView('upload')} className={`px-4 py-2 rounded-lg transition-all ${view === 'upload' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Upload</button>
          <button onClick={() => setView('ask')} className={`px-4 py-2 rounded-lg transition-all ${view === 'ask' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Quiz</button>
          <button onClick={() => setView('article')} className={`px-4 py-2 rounded-lg transition-all ${view === 'article' ? 'bg-white/20' : 'hover:bg-white/10'}`}>Article</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}

const NavCard = ({ title, desc, icon, onClick }) => (
  <div
    onClick={onClick}
    className="glass-card cursor-pointer hover:scale-105 transition-transform group text-left"
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-300">{title}</h3>
    <p className="text-gray-300 text-sm">{desc}</p>
  </div>
);

export default App;
