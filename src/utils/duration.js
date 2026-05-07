export const hmToSeconds = (hours, minutes) =>
    (parseInt(hours, 10) || 0) * 3600 + (parseInt(minutes, 10) || 0) * 60;

export const secondsToHM = (seconds) => {
    const abs = Math.abs(seconds || 0);
    return {
        hours: Math.floor(abs / 3600),
        minutes: Math.round((abs % 3600) / 60),
    };
};
