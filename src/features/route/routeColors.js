export const WALK_COLOR = '#9e9e9e';

export const getStepColor = (step) => {
    if (step.travelMode === 'TRANSIT' && step.transitDetails?.lineColor) return step.transitDetails.lineColor;
    return WALK_COLOR;
};
