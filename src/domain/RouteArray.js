import BasicArray from './BasicArray';
import Route from './Route';

export default class RouteArray extends BasicArray {
    get myClass() { return RouteArray; }

    get myItemClass() { return Route; }

    constructor(items = []) {
        super(items);
    }
}
