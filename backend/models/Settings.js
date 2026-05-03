const mongoose = require('mongoose');

const dayHoursSchema = new mongoose.Schema({
  open: { type: String, default: '09:00' },
  close: { type: String, default: '20:00' }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  parlorName: {
    type: String,
    default: 'Elite Parlor'
  },
  parlorDescription: {
    type: String,
    default: 'Your premium beauty and wellness destination'
  },
  parlorLogoUrl: {
    type: String,
    default: ''
  },
  heroVideoUrl: {
    type: String,
    default: null
  },
  heroImageUrl: {
    type: String,
    default: ''
  },
  heroTitle: {
    type: String,
    default: 'Welcome to Elegant Edge - Where beauty is personalized'
  },
  heroSubtitle: {
    type: String,
    default: 'Experience luxury and transformation'
  },
  heroCtaText: {
    type: String,
    default: 'Chat on WhatsApp'
  },
  discountText: {
    type: String,
    default: 'Get a discount'
  },
  offerBanner: {
    enabled: {
      type: Boolean,
      default: true
    },
    text: {
      type: String,
      default: 'Offer ending soon'
    },
    endsAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  },
  whyUsTitle: {
    type: String,
    default: 'Why Us'
  },
  whyUsPoints: {
    type: [String],
    default: [
      'Personalized consultation for every appointment',
      'Premium products and hygiene-first experience',
      'Skilled artists focused on your comfort and style'
    ]
  },
  customizeCtaText: {
    type: String,
    default: 'Customize your need and book'
  },
  contactEmail: {
    type: String,
    default: 'info@parlor.com'
  },
  contactPhone: {
    type: String,
    default: '+1 (555) 000-0000'
  },
  contactAddress: {
    type: String,
    default: '123 Beauty Lane, City'
  },
  locationsText: {
    type: String,
    default: 'BUSINESS BAY, DUBAI MARINA, INTERNET CITY, DIFC, ABU DHABI'
  },
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    whatsapp: { type: String, default: '' }
  },
  workingHours: {
    monday: {
      type: dayHoursSchema,
      default: () => ({ open: '09:00', close: '20:00' })
    },
    tuesday: {
      type: dayHoursSchema,
      default: () => ({ open: '09:00', close: '20:00' })
    },
    wednesday: {
      type: dayHoursSchema,
      default: () => ({ open: '09:00', close: '20:00' })
    },
    thursday: {
      type: dayHoursSchema,
      default: () => ({ open: '09:00', close: '20:00' })
    },
    friday: {
      type: dayHoursSchema,
      default: () => ({ open: '09:00', close: '21:00' })
    },
    saturday: {
      type: dayHoursSchema,
      default: () => ({ open: '10:00', close: '22:00' })
    },
    sunday: {
      type: dayHoursSchema,
      default: () => ({ open: '10:00', close: '19:00' })
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
