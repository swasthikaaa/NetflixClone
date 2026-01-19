import React from 'react';
import { X, Play, Plus, ThumbsUp } from 'lucide-react';
import './MovieDetailsModal.css';

const MovieDetailsModal = ({ movie, onClose }) => {
    if (!movie) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div
                    className="modal-banner"
                    style={{ backgroundImage: `url(${movie.backdrop_path})` }}
                >
                    <div className="modal-banner-overlay" />
                    <div className="modal-actions">
                        <button className="modal-play-btn">
                            <Play size={20} fill="black" /> Play
                        </button>
                        <button className="modal-icon-btn"><Plus size={20} /></button>
                        <button className="modal-icon-btn"><ThumbsUp size={20} /></button>
                    </div>
                </div>

                <div className="modal-body">
                    <div className="modal-info-left">
                        <div className="modal-meta">
                            <span className="match">98% Match</span>
                            <span className="year">{movie.release_date?.split('-')[0] || movie.release_date}</span>
                            <span className="quality">HD</span>
                        </div>
                        <h2 className="modal-title">{movie.title || movie.name}</h2>
                        <p className="modal-overview">{movie.overview}</p>
                    </div>

                    <div className="modal-info-right">
                        <p><span>Starring:</span> Random Actor, Famous Person</p>
                        <p><span>Genres:</span> Action, Sci-Fi, Thriller</p>
                        {movie.director && <p><span>Director:</span> {movie.director}</p>}
                        {movie.seasons && <p><span>Seasons:</span> {movie.seasons}</p>}
                        {movie.rating && <p><span>Rating:</span> {movie.rating}/10</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetailsModal;
