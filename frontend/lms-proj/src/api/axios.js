import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Replace with your actual server port
});

// Automatically attach the token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken'); // Or wherever you store your JWT
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;