import BasicArray from './BasicArray';
import Participant from './Participant';

export default class ParticipantArray extends BasicArray {
    get myClass() { return ParticipantArray; }

    get myItemClass() { return Participant; }

    constructor(items = []) {
        super(items);
    }
}
