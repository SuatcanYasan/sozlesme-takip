export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};
export const areFieldsFilled = (formData, requiredFields) => {
  return requiredFields.every(field => formData[field] && formData[field].toString().trim() !== '');
};

