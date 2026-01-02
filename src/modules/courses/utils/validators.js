
/**
 * Validate course form data
 * @param {Object} formData 
 * @returns {Array} errors
 */
export const validateCourseForm = (formData) => {
    const errors = [];
    if (!formData.name) errors.push("Course name is required");
    if (!formData.trainer) errors.push("Trainer name is required");
    if (!formData.courseType) errors.push("Course type is required");

    // Example of specific validation
    if (formData.courseType === 'Paid' && !formData.price) {
        errors.push("Price is required for paid courses");
    }

    return errors;
};
