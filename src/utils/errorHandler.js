const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: err.success || false,
    message: err.message,
    errors: err.errors || [],
  });
};

export default errorHandler;