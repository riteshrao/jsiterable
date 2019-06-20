import LibIterable from "./types";

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
     * @param {IterableIterator<T>} source The source iterable iterator to use. This can be any object that supports the {Symbol.iterator} symbol.
     * @memberof Iterable
     */
    constructor(source: { [Symbol.iterator]: () => Iterator<T> }) {
        if (!source) {
            throw new ReferenceError(`Invalid source. source is '${source}'`);
        }
        if (!source[Symbol.iterator]) {
            throw new ReferenceError(
                `Invalid source. source does not define a member for [Symbol.iterator]. Only iterables and iterable like sources are allowed`
            );
        }

        this._source = source;
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
        return [...this._source].length;
    }

    /**
     * @description Returns an iterable containing only distinct entities found in the source iterable.
     * @returns {Iterable<T>} Iterable containing distinct entities.
     * @memberof Iterable
     */
    distinct(): Iterable<T> {
        const set = new Set<T>();
        for (const item of this._source) {
            set.add(item);
        }

        return new Iterable<T>(set.values());
    }

    /**
     * @description Returns an iterable that returns only filtered elements from the source.
     * @param {(item: T) => boolean} filter The filter to apply on the source.
     * @returns {Iterable<T>} Iterable containing filtered entities.
     * @memberof Iterable
     */
    filter(filter: (item: T) => boolean): Iterable<T> {
        if (!filter) {
            throw new ReferenceError(`Invalid filter. filter is '${filter}'`);
        }

        const _that = this;
        return new Iterable<T>(
            (function* filterGenerator() {
                for (const item of _that._source) {
                    if (filter(item)) {
                        yield item;
                    }
                }
            })()
        );
    }

    /**
     * @description Gets the first element from the source iterable.
     * @param {(item: T) => boolean} [filter] Optional filter applied to find the first matching element.
     * @returns {T} The first element from the source iterable.
     * @memberof Iterable
     */
    first(filter?: (item: T) => boolean): T {
        if (filter) {
            for (const item of this._source) {
                if (filter(item)) {
                    return item;
                }
            }

            return null;
        } else {
            return this._source[Symbol.iterator]().next().value || null;
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
     * @param {(item: T) => V} selector The callback function to invoke for each element in the source.
     * @returns {Iterable<V>}
     * @memberof Iterable
     */
    map<V>(selector: (item: T) => V): Iterable<V> {
        const _that = this;
        return new Iterable<V>(
            (function* mapGenerator() {
                for (const item of _that._source) {
                    yield selector(item);
                }
            })()
        );
    }

    /**
     * @description Calls a callback for each item in the source and returns individual result values from the callback.
     * @template V
     * @param {(item: T) => Iterable<V>} selector The callback function to invoke for each element in the source.
     * @returns {Iterable<V>}
     * @memberof Iterable
     */
    mapMany<V>(selector: (item: T) => LibIterable<V>): Iterable<V> {
        const _that = this;
        return new Iterable<V>(
            (function* mapManyGenerator() {
                for (const item of _that._source) {
                    const iterable = selector(item);
                    for (const value of iterable) {
                        yield value;
                    }
                }
            })()
        );
    }

    /**
     * @description Determines whether the supplied callback function returns true for any element in the source.
     * @param {(item: T) => boolean} filter The callback function to invoke.
     * @returns {boolean}
     * @memberof Iterable
     */
    some(filter: (item: T) => boolean): boolean {
        for (const item of this._source) {
            if (filter(item)) {
                return true;
            }
        }

        return false;
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
}

export default Iterable;
