export default class BasicDomain {

    constructor(className, props = {}, defaults = {}) {
        this._className = className;
        this._attributes = {};
        this._originalValues = {};

        let attr = { ...defaults };
        if (props.attributes) {
            attr = { ...defaults, ...props.attributes };
        } else if (typeof props === 'object') {
            attr = { ...defaults, ...props };
        }

        if (props.id) {
            this.id = props.id;
        }

        Object.keys(attr).forEach(key => {
            this._attributes[key] = attr[key];
        });

        this._initOriginalValues(props._originalValues ?? {});

        Object.keys(defaults).forEach(key => {
            if (!Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), key)
                && !Object.getOwnPropertyDescriptor(this, key)) {
                Object.defineProperty(this, key, {
                    get() {
                        return this._attributes[key] ?? defaults[key];
                    },
                    set(value) {
                        this.set(key, value ?? defaults[key]);
                    },
                });
            }
        });
    }

    _initOriginalValues(incoming = {}) {
        this._originalValues = { ...incoming };
    }

    _logOriginalValue(key, nextValue, prevValue) {
        if (this._originalValues[key] === undefined) {
            this._originalValues[key] = prevValue;
        } else if (this._originalValues[key] === nextValue) {
            delete this._originalValues[key];
        }
    }

    get(key) {
        return this._attributes[key];
    }

    set(key, value) {
        if (typeof key === 'object') {
            Object.keys(key).forEach(k => {
                this._logOriginalValue(k, key[k], this.get(k));
                this._attributes[k] = key[k];
            });
        } else {
            this._logOriginalValue(key, value, this.get(key));
            this._attributes[key] = value;
        }
        return this;
    }

    reset() {
        Object.keys(this._originalValues).forEach(k => {
            this._attributes[k] = this._originalValues[k];
        });
        this._initOriginalValues();
        return this;
    }

    isDirty = () => Object.keys(this._originalValues).length > 0;

    dirtyKeys = () => Object.keys(this._originalValues);

    isSavable = () => false;

    equals(other) {
        return other && this.id != null && this.id === other.id;
    }

    clone() {
        const Cls = this.constructor;
        return new Cls({ ...this._attributes, id: this.id });
    }

    toJSON() {
        return { id: this.id, ...this._attributes };
    }

    inspect = () => {
        return new Promise(resolve => {
            resolve({});
        });
    };
}
