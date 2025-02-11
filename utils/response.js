// utils/response.js

/**
 * Utility function to send a structured response.
 * @param {object} res - The Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Response message
 * @param {object|null} data - Additional data to send in the response
 * @returns {object} The formatted response
 */
const sendResponse = (res, status, message, data = null) => {
    return res.status(status).json({
      message,
      data,
    });
  };
  
  module.exports = sendResponse;
  