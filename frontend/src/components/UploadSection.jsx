import React, { useState } from 'react';
import { uploadBook, deleteAllBooks, deleteSelectedBooks } from '../api';

const UploadSection = ({ onUploadSuccess, books }) => {
    const [password, setPassword] = useState('');
    const [file, setFile] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [msg, setMsg] = useState('');
    const [selectedBooks, setSelectedBooks] = useState([]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === '3232') {
            setIsAuthenticated(true);
            setMsg('');
        } else {
            setMsg('Incorrect Password');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        try {
            await uploadBook(file, '3232');
            setMsg('Book uploaded successfully!');
            if (onUploadSuccess) onUploadSuccess();
            setFile(null);
        } catch (err) {
            setMsg('Upload failed.');
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedBooks.length === 0) {
            alert("Please select books to delete.");
            return;
        }
        const pwd = prompt("Enter admin password to DELETE SELECTED BOOKS:");
        if (pwd === '3434') {
            try {
                await deleteSelectedBooks(selectedBooks, '3434');
                setMsg('Selected books deleted.');
                setSelectedBooks([]);
                if (onUploadSuccess) onUploadSuccess();
            } catch (err) {
                setMsg('Delete failed.');
            }
        } else {
            alert("Incorrect password!");
        }
    };

    const toggleBookSelection = (bookId) => {
        if (selectedBooks.includes(bookId)) {
            setSelectedBooks(selectedBooks.filter(id => id !== bookId));
        } else {
            setSelectedBooks([...selectedBooks, bookId]);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="glass-card max-w-md mx-auto mt-10 text-center animate-fade-in">
                <h2 className="text-2xl font-bold mb-4">Instructor Access</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        className="input-field"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className="btn-primary w-full">Unlock Upload</button>
                </form>
                {msg && <p className="mt-2 text-red-400">{msg}</p>}
            </div>
        );
    }

    return (
        <div className="glass-card max-w-2xl mx-auto mt-10 animate-slide-up relative">
            <h2 className="text-2xl font-bold mb-6">Manage Library</h2>

            {/* Upload Form */}
            <form onSubmit={handleUpload} className="space-y-4 mb-8 border-b border-white/10 pb-8">
                <label className="block text-sm font-medium text-gray-300">Upload PDF Book</label>
                <div className="flex gap-4">
                    <input
                        type="file"
                        accept="application/pdf"
                        className="block w-full text-sm text-slate-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-600 file:text-white
                hover:file:bg-indigo-700
            "
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                    <button type="submit" className="btn-primary whitespace-nowrap" disabled={!file}>
                        Upload
                    </button>
                </div>
            </form>

            {msg && <p className="mb-4 text-green-400 font-semibold">{msg}</p>}

            {/* Book List for Deletion */}
            <h3 className="text-xl font-semibold mb-4 text-indigo-200">Existing Books</h3>
            <div className="bg-white/5 rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
                {books && books.length > 0 ? (
                    <ul className="space-y-2">
                        {books.map(book => (
                            <li key={book.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                                    checked={selectedBooks.includes(book.id)}
                                    onChange={() => toggleBookSelection(book.id)}
                                />
                                <span className="text-gray-200 truncate">{book.title}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 italic">No books in library.</p>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleDeleteSelected}
                    disabled={selectedBooks.length === 0}
                    className={`
                px-6 py-2 rounded-lg font-bold transition-all shadow-lg
                ${selectedBooks.length === 0
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 text-white hover:shadow-red-500/50'}
            `}
                >
                    Delete Selected ({selectedBooks.length})
                </button>
            </div>
        </div>
    );
};

export default UploadSection;
