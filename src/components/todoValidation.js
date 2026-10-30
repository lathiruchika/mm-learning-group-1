import moment from "moment";

export const MIN_DESCRIPTION_LENGTH = 8;

// Validation rules (see README): description is required, trimmed, and at
// least 8 characters after trimming; target date is required and must be a
// real calendar date in YYYY-MM-DD format.
export function validateTodo(values) {
  const errors = {};
  const description = (values.description || "").trim();
  // Count code points, not UTF-16 units, so an emoji is one character.
  const length = Array.from(description).length;
  if (length === 0) {
    errors.description = "Description is required";
  } else if (length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `Enter at least ${MIN_DESCRIPTION_LENGTH} characters for the description (leading and trailing spaces are ignored)`;
  }
  if (!values.targetDate) {
    errors.targetDate = "Target date is required";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.targetDate) || !moment(values.targetDate, "YYYY-MM-DD", true).isValid()) {
    errors.targetDate = "Enter a valid date in YYYY-MM-DD format";
  }
  return errors;
}
