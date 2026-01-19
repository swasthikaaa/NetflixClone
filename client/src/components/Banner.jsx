import React, { useState } from 'react';
import { Play, Info } from 'lucide-react';
import MovieDetailsModal from './MovieDetailsModal';
import './Banner.css';

const Banner = ({ movie }) => {
    const [showModal, setShowModal] = useState(false);

    if (!movie) return null;

    return (
        <>
            <header
                className="banner"
                style={{
                    backgroundImage: `url(${movie.backdrop_path})`
                }}
            >
                <div className="banner-overlay" />
                <div className="banner-contents">
                    <h1 className="banner-title">{movie.title || movie.name}</h1>

                    <p className="banner-description">
                        {movie.overview}
                    </p>

                    <div className="banner-buttons">
                        <button className="banner-btn play">
                            <Play size={20} fill="black" /> Play
                        </button>
                        <button className="banner-btn info" onClick={() => setShowModal(true)}>
                            <Info size={20} /> More Info
                        </button>
                    </div>
                </div>
            </header>
            {showModal && <MovieDetailsModal movie={movie} onClose={() => setShowModal(false)} />}
        </>
    );
};

export default Banner;
