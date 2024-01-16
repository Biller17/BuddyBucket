export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

export const daysSince = (date) => {
    const today = new Date();
    const lastContactDate = new Date(date);
    const difference = today - lastContactDate;
    return Math.floor(difference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
}