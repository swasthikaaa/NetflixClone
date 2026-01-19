import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import Row from '../components/Row';
import MovieDetailsModal from '../components/MovieDetailsModal';
import Footer from '../components/Footer';
import './CategoryPage.css';

const CategoryPage = ({ title, type }) => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMovie, setSelectedMovie] = useState(null);

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5001');
            try {
                const res = await axios.get(`${API_URL}/api/movies/type/${type}`);
                setContent(res.data);
            } catch (error) {
                console.error(`Error fetching ${type}:`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [type]);

    if (loading) return (
        <div className="loading-screen">
            <h1 className="loading-logo">NETFLIX</h1>
        </div>
    );

    return (
        <div className="category-page fade-in">
            <Navbar />
            <Banner movie={content[0]} />
            <div className="category-content">
                <h1 className="category-title">{title}</h1>
                <div className="category-grid">
                    {content.map(item => (
                        <div
                            key={item.id}
                            className="content-card"
                            onClick={() => setSelectedMovie(item)}
                        >
                            <img
                                src={item.poster_path}
                                alt={item.title}
                                onError={(e) => {
                                    e.target.src = '/images/stranger_things_poster.webp';
                                    e.target.onerror = null;
                                }}
                            />
                            <div className="content-info">
                                <h4>{item.title}</h4>
                            </div>
                        </div>
                    ))}
                </div>

                <Row title="Trending Now" movies={content} />
            </div>
            <Footer />
            {selectedMovie && <MovieDetailsModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
        </div>
    );
};

export default CategoryPage;
