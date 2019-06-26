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

        it('.filter should filter items', () => {
            const items = iterable.filter(x => x.includes('l')).items();
            expect(items.length).to.equal(7);
            expect(items.some(x => x === 'alpha')).to.be.true;
        });

        it('.first should get the first item', () => {
            expect(iterable.first()).to.equal('alpha');
        });

        it('.filter should return first filtered item', () => {
            expect(iterable.first(x => x.startsWith('b'))).to.equal('bravo');
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
});
