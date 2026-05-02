import BasicArray from './BasicArray';
import Plan from './Plan';

export default class PlanArray extends BasicArray {
    get myClass() { return PlanArray; }

    get myItemClass() { return Plan; }

    constructor(items = []) {
        super(items);
    }
}
