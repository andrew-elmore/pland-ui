import BasicDomain from './BasicDomain';

export default class Plan extends BasicDomain {

    static DEFAULTS = {
        name: '',
        description: '',
        ownerId: null,
        userIds: [],
        locationIds: [],
        itineraryIds: [],
    };

    static FIELDS = Object.keys(Plan.DEFAULTS);

    constructor(props) {
        super('Plan', props, Plan.DEFAULTS);
    }

    isSavable = () => (
        this.name != null
        && this.name.trim() !== ''
    );

    toString = () => this.name || `Plan ${this.id}`;
}
