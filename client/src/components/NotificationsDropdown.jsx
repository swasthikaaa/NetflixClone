import React from 'react';
import './NotificationsDropdown.css';

const NotificationsDropdown = ({ notifications }) => {
    return (
        <div className="notifications-dropdown">
            <div className="notif-header">
                <span>Notifications</span>
            </div>
            <div className="notif-list">
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <div key={notif.id} className="notif-item">
                            <p className="notif-message">{notif.message}</p>
                            <span className="notif-date">{notif.date}</span>
                        </div>
                    ))
                ) : (
                    <p className="no-notif">No new notifications</p>
                )}
            </div>
        </div>
    );
};

export default NotificationsDropdown;
