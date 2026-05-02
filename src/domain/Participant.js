import BasicDomain from './BasicDomain';

export default class Participant extends BasicDomain {

    static ROLE_ADMIN = 'admin';
    static ROLE_ORGANIZER = 'organizer';
    static ROLE_ATTENDEE = 'attendee';
    static ROLE_VENDOR = 'vendor';

    static ROLES = [
        Participant.ROLE_ADMIN,
        Participant.ROLE_ORGANIZER,
        Participant.ROLE_ATTENDEE,
        Participant.ROLE_VENDOR,
    ];

    static ROLE_LABELS = {
        [Participant.ROLE_ADMIN]: 'Admin',
        [Participant.ROLE_ORGANIZER]: 'Organizer',
        [Participant.ROLE_ATTENDEE]: 'Attendee',
        [Participant.ROLE_VENDOR]: 'Vendor',
    };

    static DEFAULTS = {
        planId: null,
        firstName: '',
        lastName: '',
        email: '',
        role: Participant.ROLE_ATTENDEE,
        userId: null,
    };

    static FIELDS = Object.keys(Participant.DEFAULTS);

    constructor(props) {
        super('Participant', props, Participant.DEFAULTS);
    }

    get fullName() {
        return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
    }

    get isLinked() {
        return this.userId != null;
    }

    get roleLabel() {
        return Participant.ROLE_LABELS[this.role] || 'Unknown';
    }

    isSavable = () => (
        this.firstName != null
        && this.firstName.trim() !== ''
        && this.email != null
        && this.email.trim() !== ''
        && Participant.ROLES.includes(this.role)
    );

    toString = () => this.fullName || `Participant ${this.id}`;
}
