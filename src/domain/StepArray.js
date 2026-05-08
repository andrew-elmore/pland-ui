import BasicArray from './BasicArray';
import Step from './Step';

export default class StepArray extends BasicArray {
    get myClass() { return StepArray; }

    get myItemClass() { return Step; }

    constructor(items = []) {
        super(items);
    }
}
