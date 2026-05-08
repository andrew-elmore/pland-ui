import BasicArray from './BasicArray';
import Time from './Time';

export default class TimeArray extends BasicArray {
    get myClass() { return TimeArray; }

    get myItemClass() { return Time; }

    constructor(items = []) {
        super(items);
    }
}
