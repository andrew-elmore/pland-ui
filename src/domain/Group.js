import BasicDomain from './BasicDomain';

export default class Group extends BasicDomain {

    static DEFAULTS = {
        planId: null,
        name: '',
        participantIds: [],
    };

    static FIELDS = Object.keys(Group.DEFAULTS);

    constructor(props) {
        super('Group', props, Group.DEFAULTS);
        this.participantIds = Array.isArray(this.participantIds) ? [...this.participantIds] : [];
    }

    isSavable = () => (
        this.name != null
        && this.name.trim() !== ''
    );

    toString = () => this.name || `Group ${this.id}`;
}
