export const formatDate = (dateString) => {
    // Parse a bare YYYY-MM-DD as local midnight; otherwise `new Date` treats it
    // as UTC and can render the wrong day in negative-offset timezones.
    const date = typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)
        ? new Date(`${dateString}T00:00:00`)
        : new Date(dateString);
    const options = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

export const daysSince = (date) => {
    const today = new Date();
    const lastContactDate = new Date(date);
    const difference = today - lastContactDate;
    return Math.floor(difference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
}