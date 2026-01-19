import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Row from '../components/Row';
import MovieDetailsModal from '../components/MovieDetailsModal';
import Footer from '../components/Footer';
import { Search as SearchIcon } from 'lucide-react';
import './Search.css';

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query) {
                setLoading(true);
                try {
                    const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5001');
                    const res = await axios.get(`${API_URL}/api/movies/search?query=${query}`);
                    setResults(res.data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="search-page">
            <Navbar />
            <div className="search-header">
                <div className="search-input-wrapper">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search for a movie, show..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className="search-results">
                {loading ? (
                    <p className="status-msg">Searching...</p>
                ) : results.length > 0 ? (
                    <div className="results-grid">
                        {results.map(movie => (
                            <div
                                key={movie.id}
                                className="result-card fade-in"
                                onClick={() => setSelectedMovie(movie)}
                            >
                                <img
                                    src={movie.poster_path}
                                    alt={movie.title}
                                    onError={(e) => {
                                        e.target.src = '/images/stranger_things_poster.webp';
                                        e.target.onerror = null;
                                    }}
                                />
                                <h3>{movie.title}</h3>
                            </div>
                        ))}
                    </div>
                ) : query && !loading ? (
                    <p className="status-msg">No results found for "{query}"</p>
                ) : (
                    <p className="status-msg">Type to search for amazing content</p>
                )}
            </div>
            <Footer />
            {selectedMovie && <MovieDetailsModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
        </div>
    );
};

export default SearchPage;
