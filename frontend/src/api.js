import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const uploadBook = async (file, password) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
    const response = await axios.post(`${API_URL}/upload`, formData);
    return response.data;
};

export const getBooks = async () => {
    const response = await axios.get(`${API_URL}/books`);
    return response.data;
};

export const deleteAllBooks = async (password) => {
    const response = await axios.post(`${API_URL}/delete-all`, { password });
    return response.data;
};

export const deleteSelectedBooks = async (bookIds, password) => {
    const response = await axios.post(`${API_URL}/delete-selection`, { book_ids: bookIds, password });
    return response.data;
};

export const askQuestion = async (bookId) => {
    const response = await axios.post(`${API_URL}/ask`, { book_id: bookId });
    return response.data;
};

export const generateArticle = async (bookId, topic) => {
    const response = await axios.post(`${API_URL}/article`, { book_id: bookId, topic });
    return response.data;
};
