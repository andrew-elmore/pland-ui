import BasicArray from './BasicArray';
import DirectionStep from './DirectionStep';

export default class DirectionStepArray extends BasicArray {
    get myClass() { return DirectionStepArray; }

    get myItemClass() { return DirectionStep; }

    constructor(items = []) {
        super(items);
    }
}
