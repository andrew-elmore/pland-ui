import BasicDomain from './BasicDomain';

export default class DirectionStep extends BasicDomain {

    static DEFAULTS = {
        htmlInstructions: '',
        maneuver: null,
        distanceMeters: 0,
        durationSeconds: 0,
        startLat: 0,
        startLng: 0,
        endLat: 0,
        endLng: 0,
        polyline: '',
        travelMode: '',
        transitDetails: null,
    };

    static FIELDS = Object.keys(DirectionStep.DEFAULTS);

    constructor(props) {
        super('DirectionStep', props, DirectionStep.DEFAULTS);
    }

    get durationMinutes() {
        return Math.round(this.durationSeconds / 60);
    }

    get distanceDisplay() {
        if (!this.distanceMeters) return '';
        const miles = this.distanceMeters * 0.000621371;
        if (miles >= 0.1) return `${miles.toFixed(1)} mi`;
        return `${Math.round(this.distanceMeters * 3.28084)} ft`;
    }

    toString = () => this.htmlInstructions || 'Step';
}
