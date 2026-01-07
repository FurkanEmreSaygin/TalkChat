const validate = (schema) => (req, res, next) => {
  try {
    if (!schema) {
      throw new Error("Validation Schema is UNDEFINED! Check your route imports.");
    }

    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: "Veri doğrulama hatası",
        errors: error.errors.map((e) => ({
          field: e.path[1],
          message: e.message,
        })),
      });
    }

    console.error("Validation Middleware Crash:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server Validation Configuration Error",
      debug: error.message,
    });
  }
};

module.exports = validate;
