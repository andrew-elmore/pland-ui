import BasicDomain from './BasicDomain';
import { secondsToHM } from '../utils/duration';

export default class Time extends BasicDomain {

    static DEFAULTS = {
        planId: null,
        label: '',
        datetime: null,
        parentTimeId: null,
        offsetSeconds: 0,
        routeId: null,
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

    get isDependent() {
        return this.parentTimeId != null;
    }

    get isRouteDependent() {
        return this.parentTimeId != null && this.routeId != null;
    }

    get offsetDisplay() {
        if (this.routeId) {
            if (!this.offsetSeconds) return 'via route';
            const { hours: h, minutes: m } = secondsToHM(this.offsetSeconds);
            const parts = [];
            if (h) parts.push(`${h}h`);
            if (m) parts.push(`${m}m`);
            return `via route + ${parts.join(' ')}`;
        }
        if (!this.offsetSeconds) return '';
        const { hours: h, minutes: m } = secondsToHM(this.offsetSeconds);
        const sign = this.offsetSeconds >= 0 ? '+' : '-';
        if (h && m) return `${sign}${h}h ${m}m`;
        if (h) return `${sign}${h}h`;
        return `${sign}${m}m`;
    }

    isSavable = () => (this.parentTimeId != null || this.datetime != null) && this.planId != null;

    toString = () => this.displayLabel || `Time ${this.id}`;
}
