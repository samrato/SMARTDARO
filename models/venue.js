const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    location: { type: String },
    isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Venue', VenueSchema);