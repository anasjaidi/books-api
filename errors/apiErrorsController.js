
const productionErros = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		stack: err.stack,
		err
	})
}

const developementErrors = (err, res) => {
	// opeartional, trusted: send error to the client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});

		// programming or other errors: Don't leak error details
	} else {
		// 1) Log Error
		console.error(err);

		// 2) send geniric error
		res.status(500).json({
			status: "error",
			message: "Something got wrong!",
		});
	}
}

const uniqueFieldPrismaError = (err, res) => {
	res.status(400).json({
		status: 'fail',
		message: err.meta.target.join(', ') + " needs to be unique."
	})
}

const jwtInvalidTokenError = (err, res) => {
	res.status(401).json({
		status: 'fail',
		message: "invalid token."
	})
}

const jwtExpiredTokenError = (err, res) => {
	res.status(401).json({
		status: 'fail',
		message: "token is expired please re login."
	})
}

exports.errorsController = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;

	err.status = err.status || "error";

	if (process.env.NODE_ENV === "dev") {
		developementErrors(err, res)
  } else if (process.env.NODE_ENV === "production") {
		if (err.code  === "P2002") {
			return uniqueFieldPrismaError(err, res)
		} else if (err.name === "JsonWebTokenError") {
			return jwtInvalidTokenError(err, res)
		} else if (err.name === "TokenExpiredError") {
			return  jwtExpiredTokenError(err, res)
		}
    productionErros(err, res)
  }
};
