import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-socials">
                    <a href="#">Facebook</a>
                    <a href="#">Instagram</a>
                    <a href="#">Twitter</a>
                    <a href="#">YouTube</a>
                </div>
                <div className="footer-links">
                    <div className="footer-column">
                        <a href="#">Audio Description</a>
                        <a href="#">Investor Relations</a>
                        <a href="#">Privacy</a>
                        <a href="#">Contact Us</a>
                    </div>
                    <div className="footer-column">
                        <a href="#">Help Center</a>
                        <a href="#">Jobs</a>
                        <a href="#">Legal Notices</a>
                        <a href="#">Ad Choices</a>
                    </div>
                    <div className="footer-column">
                        <a href="#">Gift Cards</a>
                        <a href="#">Netflix Shop</a>
                        <a href="#">Cookie Preferences</a>
                    </div>
                    <div className="footer-column">
                        <a href="#">Media Center</a>
                        <a href="#">Terms of Use</a>
                        <a href="#">Corporate Information</a>
                    </div>
                </div>
                <div className="service-code-btn">Service Code</div>
                <div className="copyright">© 1997-2026 Netflix Clone, Inc.</div>
            </div>
        </footer>
    );
};

export default Footer;
