const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    default: 'hair'
  },
  categoryLabel: {
    type: String,
    default: ''
  },
  audience: {
    type: String,
    enum: ['her', 'him'],
    default: 'her'
  },
  categoryVideoUrl: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: null
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'none'],
    default: 'none'
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', serviceSchema);
