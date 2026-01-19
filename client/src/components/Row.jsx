import React from 'react';
import { Play, Plus } from 'lucide-react';
import './Row.css';

const Row = ({ title, movies }) => {
    return (
        <div className="row">
            <h2 className="row-title">{title}</h2>
            <div className="row-posters">
                {movies?.map((movie) => (
                    <div key={movie.id} className="row-poster-container">
                        <img
                            className="row-poster"
                            src={movie.poster_path}
                            alt={movie.title || movie.name}
                            onError={(e) => {
                                e.target.src = '/images/stranger_things_poster.webp';
                                e.target.onerror = null;
                            }}
                        />
                        <div className="poster-overlay">
                            <div className="overlay-content">
                                <div className="overlay-icons">
                                    <div className="icon-circle"><Play size={16} fill="white" /></div>
                                    <div className="icon-circle outline"><Plus size={16} /></div>
                                </div>
                                <h3 className="poster-title">{movie.title || movie.name}</h3>
                                <div className="poster-metadata">
                                    <span className="match">98% Match</span>
                                    <span className="year">{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}</span>
                                    <span className="rating">HD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Row;
