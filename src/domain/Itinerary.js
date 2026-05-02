import BasicDomain from './BasicDomain';

export default class Itinerary extends BasicDomain {

    static DEFAULTS = {
        planId: null,
        name: '',
        stepIds: [],
        windowIds: [],
    };

    static FIELDS = Object.keys(Itinerary.DEFAULTS);

    constructor(props) {
        super('Itinerary', props, Itinerary.DEFAULTS);
    }

    isSavable = () => (
        this.name != null
        && this.name.trim() !== ''
    );

    toString = () => this.name || `Itinerary ${this.id}`;
}
