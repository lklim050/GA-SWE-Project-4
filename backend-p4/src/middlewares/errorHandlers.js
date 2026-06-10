// this is to capture json error before API routes
export const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("JSON parsing error:", err.message);
    return res.status(400).json({
      status: 400,
      msg: `invalid JSON format: ${err.message}`,
    });
  } else if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    err.type === "entity.parse.failed"
  ) {
    console.error("URL-encoded parsing error:", err.message);
    return res.status(400).json({
      status: 400,
      msg: `invalid form data format: ${err.message}`,
    });
  }

  next(err); // if err, this goes to next error middleware (err) instead the api endpoint
};

// this is to capture server error after the API routes
export const globalErrorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);
  console.error(err.message);
  console.error(err.stack);

  res.status(err.status || 500).json({
    status: "error",
    msg: err.message,
  });
};
