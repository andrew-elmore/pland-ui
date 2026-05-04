import BasicArray from './BasicArray';
import Group from './Group';

export default class GroupArray extends BasicArray {
    get myClass() { return GroupArray; }

    get myItemClass() { return Group; }

    constructor(items = []) {
        super(items);
    }
}
