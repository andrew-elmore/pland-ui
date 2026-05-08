import BasicDomain from './BasicDomain';

export default class Time extends BasicDomain {

    static DEFAULTS = {
        planId: null,
        label: '',
        datetime: null,
    };

    static FIELDS = Object.keys(Time.DEFAULTS);

    constructor(props) {
        super('Time', props, Time.DEFAULTS);
    }

    get formattedTime() {
        if (!this.datetime) return '';
        return new Date(this.datetime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    get displayLabel() {
        if (this.label && this.datetime) return `${this.label}: ${this.formattedTime}`;
        if (this.label) return this.label;
        return this.formattedTime;
    }

    isSavable = () => this.datetime != null && this.planId != null;

    toString = () => this.displayLabel || `Time ${this.id}`;
}
