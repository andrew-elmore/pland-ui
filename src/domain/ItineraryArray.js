import BasicArray from './BasicArray';
import Itinerary from './Itinerary';

export default class ItineraryArray extends BasicArray {
    get myClass() { return ItineraryArray; }

    get myItemClass() { return Itinerary; }

    constructor(items = []) {
        super(items);
    }
}
