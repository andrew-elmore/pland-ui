import BasicDomain from './BasicDomain';
import Route from './Route';

export default class Step extends BasicDomain {

    static DEFAULTS = {
        itineraryId: null,
        name: '',
        startTimeId: null,
        endTimeId: null,
        startTime: null,
        endTime: null,
        participantIds: [],
        locationId: null,
        routeId: null,
        route: null,
    };

    static FIELDS = Object.keys(Step.DEFAULTS);

    constructor(props) {
        super('Step', props, Step.DEFAULTS);
        this.route = this.route ? new Route(this.route) : null;
    }

    get isRouteStep() {
        return this.routeId != null;
    }

}
