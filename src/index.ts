import LibIterable from './types';

/**
 * @description Iterable wrapper that exposes functional operations to work with arrays, maps, sets and generic iterables
 * @export
 * @class Iterable
 * @implements {Iterable<T>}
 * @template T
 */
export class Iterable<T> implements LibIterable<T> {
    private readonly _source: LibIterable<T>;

    /**
     * Creates an instance of Iterable.
     * @param {Iterable<T>} source The source iterable to use. This can be any object that supports
     * the {Symbol.iterator} symbol, or a function that returns an Iterable (e.g., a generator)
     * @memberof Iterable
     */
    constructor(source: LibIterable<T> | (() => LibIterable<T>)) {
        if (typeof source === 'function') {
            // source is an function that returns an Iterable. Get its iterator lazily:
            this._source = {
                [Symbol.iterator]: () => source()[Symbol.iterator]()
            };
        } else if (source && typeof source[Symbol.iterator] === 'function') {
            // source is a es6 iterable, use as-is:
            this._source = source;
        } else {
            throw new ReferenceError(
                `Invalid source. source does not define a member for [Symbol.iterator]. Only iterables and iterable like sources are allowed`
            );
        }
    }

    [Symbol.iterator](): Iterator<T> {
        return this._source[Symbol.iterator]();
    }

    /**
     * @description Gets the count of elements in the source iterable. The entire iterable is traversed to get the count.
     * @returns {number} The count of elements in the source iterable.
     * @memberof Iterable
     */
    count(): number {
        let num = 0;
        for (const _ of this._source) { ++num; }
        return num;
    }

    /**
     * @description Returns an iterable containing only distinct entities found in the source iterable.
     * @returns {Iterable<T>} Iterable containing distinct entities.
     * @memberof Iterable
     */
    distinct(keySelector: (item: T, index: number) => any): Iterable<T> {
        if (!keySelector) {
            throw new ReferenceError(`Invalid keySelector. keySelector is ${keySelector}`);
        }

        const src = this._source;
        return new Iterable<T>(function* () {
            const set = new Set<T>();
            let index = 0;
            for (const item of src) {
                const key = keySelector(item, index++);
                if (!set.has(key)) {
                    set.add(key);
                    yield item;
                }
            }
        });
    }

    /**
     * @description Returns an iterable that returns only filtered elements from the source.
     * @param {(item: T, index: number) => boolean} filter The filter to apply on the source.
     * @returns {Iterable<T>} Iterable containing filtered entities.
     * @memberof Iterable
     */
    filter(filter: (item: T, index: number) => boolean): Iterable<T> {
        if (!filter) {
            throw new ReferenceError(`Invalid filter. filter is '${filter}'`);
        }

        const src = this._source;
        return new Iterable<T>(function* () {
            let index = 0;
            for (const item of src) {
                if (filter(item, index++)) {
                    yield item;
                }
            }
        });
    }

    /**
     * @description Gets the first element from the source iterable.
     * @param {(item: T, index: number) => boolean} [filter] Optional filter applied to find the first matching element.
     * @returns {T} The first element from the source iterable.
     * @memberof Iterable
     */
    first(filter?: (item: T, index: number) => boolean): T {
        if (filter) {
            let index = 0;
            for (const item of this._source) {
                if (filter(item, index++)) {
                    return item;
                }
            }

            return null;
        } else {
            const { done, value } = this._source[Symbol.iterator]().next();
            return done ? null : value;
        }
    }

    /**
     * @description Gets an array of items from the source iterable.
     * @returns {T[]} Array of items from the source.
     * @memberof Iterable
     */
    items(): T[] {
        return [...this._source];
    }

    /**
     * @description Calls a callback for each item in the source and returns the returned value from the callback.
     * @template V
     * @param {(item: T, index: number) => V} selector The callback function to invoke for each element in the source.
     * @returns {Iterable<V>}
     * @memberof Iterable
     */
    map<V>(selector: (item: T, index: number) => V): Iterable<V> {
        const src = this._source;
        return new Iterable<V>(function* () {
            let index = 0;
            for (const item of src) {
                yield selector(item, index++);
            }
        });
    }

    /**
     * @description Calls a callback for each item in the source and returns individual result values from the callback.
     * @template V
     * @param {(item: T, index: number) => Iterable<V>} selector The callback function to invoke for each element in the source.
     * @returns {Iterable<V>}
     * @memberof Iterable
     */
    mapMany<V>(selector: (item: T, index: number) => LibIterable<V>): Iterable<V> {
        const src = this._source;
        return new Iterable<V>(function* () {
            let index = 0;
            for (const item of src) {
                yield* selector(item, index++);
            }
        });
    }

    /**
     * @description Determines whether the supplied callback function returns true for any element in the source.
     * @param {(item: T, index: number) => boolean} filter The callback function to invoke.
     * @returns {boolean}
     * @memberof Iterable
     */
    some(filter: (item: T, index: number) => boolean): boolean {
        let index = 0;
        for (const item of this._source) {
            if (filter(item, index++)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @description Determines whether all elements in the source satisfy the specified test.
     * @param {(item: T, index: number) => boolean} test The test function.
     * @returns {boolean}
     * @memberof Iterable
     */
    every(test: (item: T, index: number) => boolean): boolean {
        let index = 0;
        for (const item of this._source) {
            if (!test(item, index++)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @description Returns a new Iterable consisting of the elements in the
     * current object followed by that of the input argument.
     * @param other {LibIterable<T>} An iterable
     * @returns {Iterable<T>} a new Iterable that contains elements from both sources
     */
    concat(other: LibIterable<T>): Iterable<T> {
        const src = this._source;
        return new Iterable(function* () {
            yield* src;
            yield* other;
        });
    }

    /**
     * @description Gets an empty iterable.
     * @static
     * @template T The element type of the iterable.
     * @returns {Iterable<T>}
     * @memberof Iterable
     */
    static empty<T>(): Iterable<T> {
        return new Iterable<T>([]);
    }

    /**
     * Returns an Iterable of the specified object's keys.
     * @param obj {any} An object
     * @returns {Iterable<string>} The keys of the specified object.
     */
    static keys(obj: any): Iterable<string> {
        return new Iterable(function* () {
            for (const key in obj) {
                yield key;
            }
        });
    }

    /**
     * Returns an Iterable of the specified object's values.
     * @param obj {any} An object
     * @returns {Iterable<any>} The values of the specified object.
     */
    static values(obj: any): Iterable<any> {
        return new Iterable(function* () {
            for (const key in obj) {
                yield obj[key];
            }
        });
    }
}

export default Iterable;
