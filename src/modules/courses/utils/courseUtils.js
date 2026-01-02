
// Placeholder for data formatting or API transformation helpers
export const formatCurrency = (amount) => {
    return `₹${amount}`;
};

export const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};
