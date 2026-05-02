import BasicDomain from './BasicDomain';
import DirectionStepArray from './DirectionStepArray';

export default class Route extends BasicDomain {

    static TRAVEL_MODE_DRIVE = 'drive';
    static TRAVEL_MODE_WALK = 'walk';
    static TRAVEL_MODE_TRANSIT = 'transit';

    static TRAVEL_MODES = [
        Route.TRAVEL_MODE_DRIVE,
        Route.TRAVEL_MODE_WALK,
        Route.TRAVEL_MODE_TRANSIT,
    ];

    static TRAVEL_MODE_LABELS = {
        [Route.TRAVEL_MODE_DRIVE]: 'Drive',
        [Route.TRAVEL_MODE_WALK]: 'Walk',
        [Route.TRAVEL_MODE_TRANSIT]: 'Transit',
    };

    static TRANSIT_MODE_BUS = 'bus';
    static TRANSIT_MODE_SUBWAY = 'subway';
    static TRANSIT_MODE_TRAIN = 'train';
    static TRANSIT_MODE_TRAM = 'tram';
    static TRANSIT_MODE_FERRY = 'ferry';

    static TRANSIT_MODES = [
        Route.TRANSIT_MODE_BUS,
        Route.TRANSIT_MODE_SUBWAY,
        Route.TRANSIT_MODE_TRAIN,
        Route.TRANSIT_MODE_TRAM,
        Route.TRANSIT_MODE_FERRY,
    ];

    static TRANSIT_MODE_LABELS = {
        [Route.TRANSIT_MODE_BUS]: 'Bus',
        [Route.TRANSIT_MODE_SUBWAY]: 'Subway',
        [Route.TRANSIT_MODE_TRAIN]: 'Train',
        [Route.TRANSIT_MODE_TRAM]: 'Tram',
        [Route.TRANSIT_MODE_FERRY]: 'Ferry',
    };

    static TIME_MODE_DEPART_AT = 'depart_at';
    static TIME_MODE_ARRIVE_BY = 'arrive_by';

    static TIME_MODES = [
        Route.TIME_MODE_DEPART_AT,
        Route.TIME_MODE_ARRIVE_BY,
    ];

    static TIME_MODE_LABELS = {
        [Route.TIME_MODE_DEPART_AT]: 'Leave At',
        [Route.TIME_MODE_ARRIVE_BY]: 'Arrive By',
    };

    static DEFAULTS = {
        originLocationId: null,
        destinationLocationId: null,
        originLocation: null,
        destinationLocation: null,
        travelMode: Route.TRAVEL_MODE_DRIVE,
        transitModes: [],
        timeMode: Route.TIME_MODE_DEPART_AT,
        durationSeconds: 0,
        distanceMeters: 0,
        overviewPolyline: '',
        steps: [],
        departureTime: null,
        arrivalTime: null,
    };

    static FIELDS = Object.keys(Route.DEFAULTS);

    constructor(props) {
        super('Route', props, Route.DEFAULTS);
        this.steps = new DirectionStepArray(this.steps ?? []);
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

    get travelModeLabel() {
        return Route.TRAVEL_MODE_LABELS[this.travelMode] || 'Unknown';
    }

    get timeModeLabel() {
        return Route.TIME_MODE_LABELS[this.timeMode] || 'Unknown';
    }

    get originName() {
        return this.originLocation?.name || '';
    }

    get destinationName() {
        return this.destinationLocation?.name || '';
    }

    isSavable = () => (
        this.originLocationId != null
        && this.destinationLocationId != null
        && Route.TRAVEL_MODES.includes(this.travelMode)
    );

    toString = () => `${this.travelModeLabel} (${this.durationMinutes} min)`;
}
