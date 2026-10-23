const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cycle: {
      type: String, // e.g. "Q1 2026", "Annual 2026"
      required: true,
    },
    ratings: {
      technicalSkills: { type: Number, min: 1, max: 5, default: 4 },
      communication: { type: Number, min: 1, max: 5, default: 4 },
      teamwork: { type: Number, min: 1, max: 5, default: 4 },
      punctuality: { type: Number, min: 1, max: 5, default: 4 },
      leadership: { type: Number, min: 1, max: 5, default: 4 },
      overallRating: { type: Number, min: 1, max: 5, default: 4 },
    },
    strengths: String,
    areasOfImprovement: String,
    feedback: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Acknowledged'],
      default: 'Submitted',
    },
    acknowledgedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Review', reviewSchema);
