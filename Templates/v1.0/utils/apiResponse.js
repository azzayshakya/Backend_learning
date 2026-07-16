function ApiResponse(statusCode, data = null, message = "Success") {
  return {
    statusCode,
    data,
    message,
    success: statusCode < 400,
  };
}

module.exports = ApiResponse;
