// utils/helpers.js

// Capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Check if seat is available
function isSeatAvailable(seat) {
  return seat.isAvailable && !seat.currentBooking;
}

// Generate a random booking ID
function generateBookingId() {
  return "BK-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Format dates nicely
function formatDate(date) {
  return new Date(date).toLocaleString();
}

module.exports = {
  capitalize,
  isSeatAvailable,
  generateBookingId,
  formatDate,
};
