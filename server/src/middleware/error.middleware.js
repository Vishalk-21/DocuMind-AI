export const errorHandler = (error, req, res, next) => {

	console.error(error);

	const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600
		? error.status
		: Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 600
			? error.statusCode
			: 500;
	const message = status === 429
		? "Gemini API quota exhausted. Please wait for the quota to reset or enable billing."
		: error.message || "Internal server error";

	res.status(status).json({
		success: false,
		message
	});
};
