const formatDistance = (meters) => {
    if (!meters) return '';
    const miles = meters * 0.000621371;
    if (miles >= 0.1) return `${miles.toFixed(1)} mi`;
    return `${Math.round(meters * 3.28084)} ft`;
};

export default formatDistance;
