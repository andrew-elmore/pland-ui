import BasicDomain from './BasicDomain';
import formatDistance from '../utils/formatDistance';

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
        return formatDistance(this.distanceMeters);
    }

    toString = () => this.htmlInstructions || 'Step';
}
