import BasicDomain from './BasicDomain';

export default class Profile extends BasicDomain {

    static DEFAULTS = {
        userId: null,
        firstName: '',
        lastName: '',
        phone: '',
    };

    static FIELDS = Object.keys(Profile.DEFAULTS);

    constructor(props) {
        super('Profile', props, Profile.DEFAULTS);
    }

    get initials() {
        const first = this.firstName?.charAt(0)?.toUpperCase() ?? '';
        const last = this.lastName?.charAt(0)?.toUpperCase() ?? '';
        return `${first}${last}`.trim();
    }

    get fullName() {
        return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
    }

    isSavable = () => (
        this.firstName != null
        && this.firstName.trim() !== ''
    );

    toString = () => this.fullName ?? `Profile ${this.id}`;
}
