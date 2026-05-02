import BasicDomain from './BasicDomain';

export default class Location extends BasicDomain {

    static DEFAULTS = {
        planId: null,
        name: '',
        address: '',
        googlePlaceId: null,
        latitude: null,
        longitude: null,
    };

    static FIELDS = Object.keys(Location.DEFAULTS);

    constructor(props) {
        super('Location', props, Location.DEFAULTS);
    }

    get hasCoordinates() {
        return this.latitude != null && this.longitude != null;
    }

    isSavable = () => (
        this.name != null
        && this.name.trim() !== ''
    );

    toString = () => this.name || `Location ${this.id}`;
}
