import BasicArray from './BasicArray';
import Location from './Location';

export default class LocationArray extends BasicArray {
    get myClass() { return LocationArray; }

    get myItemClass() { return Location; }

    constructor(items = []) {
        super(items);
    }
}
