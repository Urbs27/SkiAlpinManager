const sendSuccess = (res, data) => {
  res.status(200).json(data);
};

const sendError = (res, error) => {
  res.status(500).json({ message: error.message });
};

module.exports = {
  sendSuccess,
  sendError
}; 