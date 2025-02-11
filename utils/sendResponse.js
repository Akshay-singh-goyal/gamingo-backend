const sendResponse = (res, status, message, data = null) => {
    return res.status(status).json({ message, data });
  };
  
  module.exports = { sendResponse };
  