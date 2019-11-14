import 'mocha';
import { expect } from 'chai';
import Iterable from '../src';

describe('Iterable', () => {
    it('.ctor should throw when source is not iterable', () => {
        expect(() => new Iterable(1 as any)).to.throw(ReferenceError);
    });

    it('.ctor shoud throw when source is null or undefined', () => {
        expect(() => new Iterable(null)).to.throw(ReferenceError);
        expect(() => new Iterable(undefined)).to.throw(ReferenceError);
    });

    it('.ctor shoud support generators', () => {
        const iterable = new Iterable(function* foo() {
            yield 1;
            yield 2;
        });

        expect(iterable.count()).to.equal(2);
    });

    it('.ctor shoud support lazy functions', () => {
        const iterable = new Iterable(() => [1, 2]);
        expect(iterable.count()).to.equal(2);
    });

    it('.empty should return an empty iterable', () => {
        const iterable = Iterable.empty<string>();
        expect(iterable).to.be.ok;
        expect(iterable.count()).to.equal(0);
    });

    it('.filter should throw when filter is null or undefined', () => {
        const iterable = new Iterable([1, 2, 3]);
        expect(() => iterable.filter(null)).to.throw(ReferenceError);
        expect(() => iterable.filter(undefined)).to.throw(ReferenceError);
    });

    it('.distinct should throw when selector is null or undefined', () => {
        const iterable = new Iterable([1, 2, 3]);
        expect(() => iterable.distinct(null)).to.throw(ReferenceError);
        expect(() => iterable.distinct(undefined)).to.throw(ReferenceError);
    });

    describe('from arrays', () => {
        let iterable: Iterable<string>;

        beforeEach(() => {
            iterable = new Iterable([
                'alpha',
                'bravo',
                'charlie',
                'delta',
                'echo',
                'foxtrot',
                'golf',
                'hotel',
                'lima',
                'charlie'
            ]);
        });

        it('.count should return count', () => {
            expect(iterable.count()).to.equal(10);
        });

        it('.distinct should return distinct entries', () => {
            const items = iterable.distinct(x => x).items();
            expect(items.length).to.equal(9);
            expect(items.filter(x => x === 'charlie').length).to.equal(1);
        });

        it('.filter should filter items', () => {
            const items = iterable.filter(x => x.includes('l')).items();
            expect(items.length).to.equal(7);
            expect(items.some(x => x === 'alpha')).to.be.true;
        });

        it('.first should get the first item', () => {
            expect(iterable.first()).to.equal('alpha');
        });

        it('.first should return null when no item matches filter', () => {
            const item = iterable.first(x => x.includes('z'));
            expect(item).to.be.null;
        });

        it('.first should return null when source is empty', () => {
            const emptyIterable = new Iterable<string>([]);
            const item = emptyIterable.first();
            expect(item).to.be.null;
        });

        it('.filter should return first filtered item', () => {
            expect(iterable.first(x => x.startsWith('b'))).to.equal('bravo');
        });

        it('.map should map all items', () => {
            const items = iterable.map((x, i) => x + i.toString()).items();
            expect(items.length).to.equal(10);
            expect(items[0]).to.equal('alpha0');
            expect(items[5]).to.equal('foxtrot5');
            expect(items[9]).to.equal('charlie9');
        });

        it('.mapMany should map all items', () => {
            const items = iterable
                .map(x => x.split(''))
                .mapMany(x => x)
                .distinct(x => x)
                .items();

            expect(items.length).to.equal(17); // Distinct characters
        });

        it('.some should return true when entity exists', () => {
            expect(iterable.some(x => x.includes('x'))).to.be.true;
        });

        it('.some should return false when entity exists', () => {
            expect(iterable.some(x => x.includes('z'))).to.be.false;
        });

        it('.every should return true when all elements match condition', () => {
            expect(iterable.every((x, i) => x.length > 0 && i >= 0)).to.be.true;
        });

        it('.every should return false when any element does not match condition', () => {
            expect(iterable.every(x => x === 'alpha')).to.be.false;
        });
    });

    describe('from maps', () => {
        let iterable: Iterable<[string, string]>;

        beforeEach(() => {
            iterable = new Iterable(
                new Map<string, string>([
                    ['a', 'alpha'],
                    ['b', 'bravo'],
                    ['c', 'charlie'],
                    ['d', 'delta'],
                    ['e', 'echo'],
                    ['f', 'foxtrot'],
                    ['g', 'golf'],
                    ['h', 'hotel'],
                    ['l', 'lima'],
                    ['_', 'charlie']
                ])
            );
        });

        it('.count should return count', () => {
            expect(iterable.count()).to.equal(10);
        });

        it('.distinct should return distinct entries', () => {
            const items = iterable
                .map(([, value]) => value)
                .distinct(x => x)
                .items();
            expect(items.length).to.equal(9);
        });

        it('.filter should filter items', () => {
            const items = iterable.filter(([, value]) => value.includes('l')).items();
            expect(items.length).to.equal(7);
            expect(items.some(([, value]) => value === 'alpha')).to.be.true;
        });

        it('.first should get the first item', () => {
            expect(iterable.first()).to.deep.equal(['a', 'alpha']);
        });

        it('.map should map all items', () => {
            const items = iterable.map(([, value]) => value.length).items();
            expect(items.length).to.equal(10);
            expect(items[0]).to.equal(5);
            expect(items[5]).to.equal(7);
            expect(items[9]).to.equal(7);
        });

        it('.mapMany should map all items', () => {
            const items = iterable
                .map(([, value]) => value.split(''))
                .mapMany(x => x)
                .distinct(x => x)
                .items();

            expect(items.length).to.equal(17); // Distinct characters
        });

        it('.some should return true when entity exists', () => {
            expect(iterable.some(([, value]) => value.includes('x'))).to.be.true;
        });

        it('.some should return false when entity exists', () => {
            expect(iterable.some(([, value]) => value.includes('z'))).to.be.false;
        });
    });

    describe('from sets', () => {
        let iterable: Iterable<string>;

        beforeEach(() => {
            iterable = new Iterable(
                new Set<string>([
                    'alpha',
                    'bravo',
                    'charlie',
                    'delta',
                    'echo',
                    'foxtrot',
                    'golf',
                    'hotel',
                    'lima',
                    'charlie'
                ])
            );
        });

        it('.count should return count', () => {
            expect(iterable.count()).to.equal(9);
        });

        it('.filter should filter items', () => {
            const items = iterable.filter(x => x.includes('l')).items();
            expect(items.length).to.equal(6);
            expect(items.some(x => x === 'alpha')).to.be.true;
        });

        it('.first should get the first item', () => {
            expect(iterable.first()).to.equal('alpha');
        });

        it('.map should map all items', () => {
            const items = iterable.map(x => x.length).items();
            expect(items.length).to.equal(9);
            expect(items[0]).to.equal(5);
            expect(items[5]).to.equal(7);
            expect(items[6]).to.equal(4);
        });

        it('.mapMany should map all items', () => {
            const items = iterable
                .map(x => x.split(''))
                .mapMany(x => x)
                .distinct(x => x)
                .items();

            expect(items.length).to.equal(17); // Distinct characters
        });

        it('.some should return true when entity exists', () => {
            expect(iterable.some(x => x.includes('x'))).to.be.true;
        });

        it('.some should return false when entity exists', () => {
            expect(iterable.some(x => x.includes('z'))).to.be.false;
        });
    });

    describe('from generators', () => {
        let iterable: Iterable<string>;

        beforeEach(() => {
            iterable = new Iterable(
                (function* strings() {
                    yield 'alpha';
                    yield 'bravo';
                    yield 'charlie';
                    yield 'delta';
                    yield 'echo';
                    yield 'foxtrot';
                    yield 'golf';
                    yield 'hotel';
                    yield 'lima';
                    yield 'charlie';
                })()
            );
        });

        it('.count should return count', () => {
            expect(iterable.count()).to.equal(10);
        });

        it('.distinct should return distinct entries', () => {
            const items = iterable.distinct(x => x).items();
            expect(items.length).to.equal(9);
            expect(items.filter(x => x === 'charlie').length).to.equal(1);
        });

        it('.filter should filter items', () => {
            const items = iterable.filter(x => x.includes('l')).items();
            expect(items.length).to.equal(7);
            expect(items.some(x => x === 'alpha')).to.be.true;
        });

        it('.first should get the first item', () => {
            expect(iterable.first()).to.equal('alpha');
        });

        it('.map should map all items', () => {
            const items = iterable.map(x => x.length).items();
            expect(items.length).to.equal(10);
            expect(items[0]).to.equal(5);
            expect(items[5]).to.equal(7);
            expect(items[9]).to.equal(7);
        });

        it('.mapMany should map all items', () => {
            const items = iterable
                .map(x => x.split(''))
                .mapMany(x => x)
                .distinct(x => x)
                .items();

            expect(items.length).to.equal(17); // Distinct characters
        });

        it('.some should return true when entity exists', () => {
            expect(iterable.some(x => x.includes('x'))).to.be.true;
        });

        it('.some should return false when entity exists', () => {
            expect(iterable.some(x => x.includes('z'))).to.be.false;
        });
    });

    describe('from iterables', () => {
        let iterable: Iterable<string>;

        beforeEach(() => {
            const inner = new Iterable([
                'alpha',
                'bravo',
                'charlie',
                'delta',
                'echo',
                'foxtrot',
                'golf',
                'hotel',
                'lima',
                'charlie'
            ]);

            iterable = new Iterable(inner);
        });

        it('.count should return count', () => {
            expect(iterable.count()).to.equal(10);
        });

        it('.distinct should return distinct entries', () => {
            const items = iterable.distinct(x => x).items();
            expect(items.length).to.equal(9);
            expect(items.filter(x => x === 'charlie').length).to.equal(1);
        });

        it('.distinct should be invocable multiple times', () => {
            const items = iterable.distinct(x => x);

            // assert items can be iterated on multiple times
            expect(items.count()).to.equal(9);
            expect(items.count()).to.equal(9);
        });

        it('.filter should filter items', () => {
            const items = iterable.filter(x => x.includes('l')).items();
            expect(items.length).to.equal(7);
            expect(items.some(x => x === 'alpha')).to.be.true;
        });

        it('.first should get the first item', () => {
            expect(iterable.first()).to.equal('alpha');
        });
        it('.first should support empty string', () => {
            iterable = new Iterable(['']);
            expect(iterable.first()).to.equal('');
        });

        it('.first should support 0', () => {
            const iterable = new Iterable([0]);
            expect(iterable.first()).to.equal(0);
        });

        it('.first should support false', () => {
            const iterable = new Iterable([false]);
            expect(iterable.first()).to.equal(false);
        });

        it('.first should support undefined', () => {
            const iterable = new Iterable([undefined]);
            expect(iterable.first()).to.equal(undefined);
        });

        it('.filter should return first filtered item', () => {
            expect(iterable.first(x => x.startsWith('b'))).to.equal('bravo');
        });

        it('.filter should be invocable multiple times', () => {
            const filtered = iterable.filter(x => x.startsWith('b'));

            // assert filtered can be iterated on multiple times
            expect(filtered.first()).to.equal('bravo');
            expect(filtered.first()).to.equal('bravo');
        });

        it('.map should map all items', () => {
            const items = iterable.map(x => x.length).items();
            expect(items.length).to.equal(10);
            expect(items[0]).to.equal(5);
            expect(items[5]).to.equal(7);
            expect(items[9]).to.equal(7);
        });

        it('.map should be invocable multiple times', () => {
            const items = iterable.map(x => x + '_map');

            // assert items can be iterated on multiple times
            expect(items.first()).to.equal('alpha_map');
            expect(items.first()).to.equal('alpha_map');
        });

        it('.mapMany should map all items', () => {
            const items = iterable
                .map(x => x.split(''))
                .mapMany(x => x)
                .distinct(x => x)
                .items();

            expect(items.length).to.equal(17); // Distinct characters
        });

        it('.some should return true when entity exists', () => {
            expect(iterable.some(x => x.includes('x'))).to.be.true;
        });

        it('.some should return false when entity exists', () => {
            expect(iterable.some(x => x.includes('z'))).to.be.false;
        });
    });

    describe('concat', () => {
        it('can concatenate with arrays', () => {
            const src = new Iterable(['a', 'b']);
            const result = src.concat(['c', 'd']);
            expect(result.items()).to.eql(['a', 'b', 'c', 'd']);
        });

        it('can concatenate with empty iterable', () => {
            const src = new Iterable(['a', 'b']);
            const result = src.concat(Iterable.empty());
            expect(result.items()).to.eql(['a', 'b']);
        });

        it('can concatenate with lazy iterable', () => {
            const src = new Iterable(['a', 'b']);
            const result = src.concat(new Iterable(() => ['c', 'd']));
            expect(result.items()).to.eql(['a', 'b', 'c', 'd']);
        });
    });

    describe('object keys', () => {
        it('expect empty object to have 0 keys', () => {
            const keys = Iterable.keys({});
            expect(keys.count()).to.equal(0);
        });

        it('expect null object to have 0 keys', () => {
            const keys = Iterable.keys(null);
            expect(keys.count()).to.equal(0);
        });

        it('expect undefined object to have 0 keys', () => {
            const keys = Iterable.keys(undefined);
            expect(keys.count()).to.equal(0);
        });

        it('expect non-empty object to have keys', () => {
            const keys = Iterable.keys({ a: 1, b: 2 });
            expect(keys.items()).to.eql(['a', 'b']);
        });
    });

    describe('object values', () => {
        it('expect empty object to have 0 values', () => {
            const keys = Iterable.values({});
            expect(keys.count()).to.equal(0);
        });

        it('expect null object to have 0 values', () => {
            const keys = Iterable.values(null);
            expect(keys.count()).to.equal(0);
        });

        it('expect undefined object to have 0 values', () => {
            const keys = Iterable.values(undefined);
            expect(keys.count()).to.equal(0);
        });

        it('expect non-empty object to have values', () => {
            const keys = Iterable.values({ a: 1, b: 2 });
            expect(keys.items()).to.eql([1, 2]);
        });
    });
});
