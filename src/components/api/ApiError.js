// Error model shared by the dummy adapter and the backend wrapper: { code, message }.
export const ERROR_CODES = {
    NOT_FOUND: "NOT_FOUND",
    STORAGE_UNAVAILABLE: "STORAGE_UNAVAILABLE",
    SIMULATED_ERROR: "SIMULATED_ERROR",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    UNKNOWN: "UNKNOWN",
};

export class TodoApiError extends Error {
    constructor(code, message, fieldErrors) {
        super(message);
        this.name = "TodoApiError";
        this.code = code;
        if (fieldErrors) {
            this.fieldErrors = fieldErrors;
        }
    }
}

export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") =>
    (error && error.message) || fallback;
