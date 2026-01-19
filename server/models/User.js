const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        name: {
            type: String,
            default: 'New User'
        },
        avatar: {
            type: String,
            default: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'
        }
    },
    plan: {
        type: String,
        default: 'Basic'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
