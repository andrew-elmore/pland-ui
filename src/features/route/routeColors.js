export const WALK_COLOR = '#9e9e9e';
export const DRIVE_COLOR = '#42a5f5';
export const WAIT_COLOR = '#616161';
export const DEFAULT_TRANSIT_COLOR = '#ab47bc';

export const getStepColor = (step) => {
    if (step.travelMode === 'TRANSIT' && step.transitDetails?.lineColor) return step.transitDetails.lineColor;
    if (step.travelMode === 'TRANSIT') return DEFAULT_TRANSIT_COLOR;
    if (step.travelMode === 'DRIVING') return DRIVE_COLOR;
    return WALK_COLOR;
};
