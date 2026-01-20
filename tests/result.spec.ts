import { KIND } from '../src/common';
import { pipe } from '../src/pipe';
import { Result, ResultErr, ResultOk } from '../src/result';

describe('result', () => {
    describe('isOk', () => {
        it('should return true for ok results', () => {
            const result = Result.ok(123);
            expect(Result.isOk(result)).toEqual(true);
        });

        it('should return false for err results', () => {
            const result = Result.err(123);
            expect(Result.isOk(result)).toEqual(false);
        });

        it('should return true for ok result-like', () => {
            const result: ResultOk<number> = {
                data: 123,
                [KIND]: 'result_ok',
            };

            expect(Result.isOk(result)).toEqual(true);
        });

        it('should return false for err result-like', () => {
            const result: ResultErr<number> = {
                data: 123,
                [KIND]: 'result_err',
            };

            expect(Result.isOk(result)).toEqual(false);
        });
    });

    describe('isErr', () => {
        it('should return true for err results', () => {
            const result = Result.err(123);
            expect(Result.isErr(result)).toEqual(true);
        });

        it('should return false for ok results', () => {
            const result = Result.ok(123);
            expect(Result.isErr(result)).toEqual(false);
        });

        it('should return true for err result-like', () => {
            const result: ResultErr<number> = {
                data: 123,
                [KIND]: 'result_err',
            };

            expect(Result.isErr(result)).toEqual(true);
        });

        it('should return false for ok result-like', () => {
            const result: ResultOk<number> = {
                data: 123,
                [KIND]: 'result_ok',
            };

            expect(Result.isErr(result)).toEqual(false);
        });
    });

    describe('wrapOk', () => {
        it('should return ok result for non-result data', () => {
            const result = Result.wrapOk(123);
            expect(Result.isOk(result)).toEqual(true);
        });

        it('should return same result for ok result', () => {
            const result = Result.ok(123);
            const actual = Result.wrapOk(result);
            expect(result).toBe(actual);
        });

        it('should return same result for err result', () => {
            const result = Result.err(123);
            const actual = Result.wrapOk(result);
            expect(result).toBe(actual);
        });
    });

    describe('wrapErr', () => {
        it('should return err result for non-result data', () => {
            const result = Result.wrapErr(123);
            expect(Result.isErr(result)).toEqual(true);
        });

        it('should return same result for ok result', () => {
            const result = Result.ok(123);
            const actual = Result.wrapErr(result);
            expect(result).toBe(actual);
        });

        it('should return same result for err result', () => {
            const result = Result.err(123);
            const actual = Result.wrapErr(result);
            expect(result).toBe(actual);
        });
    });

    describe('map', () => {
        it('should map ok result to another result with data', () => {
            const data = 123;
            const expected = data * 2;
            const result = Result.ok(data);

            const actual = Result.map(result, (data) => data * 2);

            expect(actual.data).toEqual(expected);
        });

        it('should map ok result asynchronously to another result with data', async () => {
            const data = 123;
            const expected = data * 2;
            const result = Result.ok(data);

            const actual = Result.map(result, async (data) => data * 2);

            await expect(actual).resolves.toEqual(expect.objectContaining({ data: expected }));
        });

        it('should not map err result to another result with data', () => {
            const result = Result.err(123);

            const actual = Result.map(result, () => {
                throw new Error('should not be executed');
            });

            expect(actual).toBe(result);
        });

        it('should reduce ok result to another result with result data', () => {
            const data = 123;
            const expected = data * 2;
            const result = Result.ok(data);

            const actual = Result.map(result, (data) => Result.ok(data * 2));

            expect(actual.data).toEqual(expected);
        });

        it('should reduce ok result to err result', () => {
            const data = 123;
            const expected = 'error';
            const result = Result.ok(data);

            const actual = Result.map(result, (data) => Result.err(expected));

            expect(Result.isErr(actual)).toEqual(true);
            expect(actual.data).toEqual(expected);
        });
    });

    describe('mapErr', () => {
        it('should map err result to another result with data', () => {
            const data = 123;
            const expected = data * 2;
            const result = Result.err(data);

            const actual = Result.mapErr(result, (data) => data * 2);

            expect(actual.data).toEqual(expected);
        });

        it('should map err result asynchronously to another result with data', async () => {
            const data = 123;
            const expected = data * 2;
            const result = Result.err(data);

            const actual = Result.mapErr(result, async (data) => data * 2);

            await expect(actual).resolves.toEqual(expect.objectContaining({ data: expected }));
        });

        it('should not map ok result to another result with data', () => {
            const result = Result.ok(123);

            const actual = Result.mapErr(result, () => {
                throw new Error('should not be executed');
            });

            expect(actual).toBe(result);
        });

        it('should reduce err result to another result with result data', () => {
            const data = 123;
            const expected = data * 2;
            const result = Result.err(data);

            const actual = Result.mapErr(result, (data) => Result.err(data * 2));

            expect(actual.data).toEqual(expected);
        });

        it('should reduce err result to ok result', () => {
            const data = 123;
            const expected = 'ok';
            const result = Result.err(data);

            const actual = Result.mapErr(result, () => Result.ok(expected));

            expect(Result.isOk(actual)).toEqual(true);
            expect(actual.data).toEqual(expected);
        });
    });

    describe('curried map', () => {
        it('should map ok result to another result with data', () => {
            const data = 123;
            const expected = data * 2;
            const result = Result.ok(data);

            const actual = pipe(
                result,
                Result.map((data) => data * 2),
            );

            expect(actual.data).toEqual(expected);
        });

        it('should map ok result asynchronously to another result with data', async () => {
            const data = 123;
            const expected = data * 2;
            const result = Result.ok(data);

            const actual = pipe(
                result,
                Result.map(async (data) => data * 2),
            );

            await expect(actual).resolves.toEqual(expect.objectContaining({ data: expected }));
        });

        it('should not map err result to another result with data', () => {
            const result = Result.err(123);

            const actual = pipe(
                result,
                Result.map(() => {
                    throw new Error('should not be executed');
                }),
            );

            expect(actual).toBe(result);
        });

        it('should reduce ok result to another result with result data', () => {
            const data = 123;
            const expected = data * 2;
            const result = Result.ok(data);

            const actual = pipe(
                result,
                Result.map((data) => Result.ok(data * 2)),
            );

            expect(actual.data).toEqual(expected);
        });

        it('should reduce ok result to err result', () => {
            const data = 123;
            const expected = 'error';
            const result = Result.ok(data);

            const actual = pipe(
                result,
                Result.map((data) => Result.err(expected)),
            );

            expect(Result.isErr(actual)).toEqual(true);
            expect(actual.data).toEqual(expected);
        });
    });

    describe('curried mapErr', () => {
        it('should map err result to another result with data', () => {
            const data = 123;
            const expected = data * 2;
            const result = Result.err(data);

            const actual = pipe(
                result,
                Result.mapErr((data) => data * 2),
            );

            expect(actual.data).toEqual(expected);
        });

        it('should map err result asynchronously to another result with data', async () => {
            const data = 123;
            const expected = data * 2;
            const result = Result.err(data);

            const actual = pipe(
                result,
                Result.mapErr(async (data) => data * 2),
            );

            await expect(actual).resolves.toEqual(expect.objectContaining({ data: expected }));
        });

        it('should not map ok result to another result with data', () => {
            const result = Result.ok(123);

            const actual = pipe(
                result,
                Result.mapErr(() => {
                    throw new Error('should not be executed');
                }),
            );

            expect(actual).toBe(result);
        });

        it('should reduce err result to another result with result data', () => {
            const data = 123;
            const expected = data * 2;
            const result = Result.err(data);

            const actual = pipe(
                result,
                Result.mapErr((data) => Result.err(data * 2)),
            );

            expect(actual.data).toEqual(expected);
        });

        it('should reduce err result to ok result', () => {
            const data = 123;
            const expected = 'ok';
            const result = Result.err(data);

            const actual = pipe(
                result,
                Result.mapErr(() => Result.ok(expected)),
            );

            expect(Result.isOk(actual)).toEqual(true);
            expect(actual.data).toEqual(expected);
        });
    });

    describe('flat', () => {
        it('should flatten ok result datas into single ok result with data array', () => {
            const data = [1, 2, 3, 4, 5];
            const results = data.map(Result.ok);
            const expected = Result.ok(data);

            const actual = Result.flat(results);

            expect(actual).toEqual(expected);
        });

        it('should return first err result if any of the results is err', () => {
            const data = [1, 'err1', 3, 'err2', 5];
            const results = data.map((data) => (typeof data === 'number' ? Result.ok(data) : Result.err(data)));
            const expected = Result.err('err1');

            const actual = Result.flat(results);

            expect(actual).toEqual(expected);
        });

        it('should preserve tuple types for strongly-typed tuple input', () => {
            const r1 = Result.ok<number, string>(42);
            const r2 = Result.ok<string, string>('hello');
            const r3 = Result.ok<boolean, string>(true);

            const actual = Result.flat([r1, r2, r3]);

            // Runtime check
            expect(Result.isOk(actual)).toBe(true);
            expect(actual.data).toEqual([42, 'hello', true]);

            // Compile-time type check: if this compiles, the tuple type is preserved
            if (Result.isOk(actual)) {
                const [num, str, bool]: [number, string, boolean] = actual.data;
                expect(num).toBe(42);
                expect(str).toBe('hello');
                expect(bool).toBe(true);
            }
        });

        it('should preserve tuple types with mixed error types', () => {
            const r1 = Result.ok<number, string>(1);
            const r2 = Result.ok<string, Error>('test');

            const actual = Result.flat([r1, r2]);

            if (Result.isOk(actual)) {
                const [num, str]: [number, string] = actual.data;
                expect(num).toBe(1);
                expect(str).toBe('test');
            }
        });

        it('should return error with correct type from tuple', () => {
            const r1 = Result.ok<number, string>(1);
            const r2 = Result.err<string, string>('error message');
            const r3 = Result.ok<boolean, string>(true);

            const actual = Result.flat([r1, r2, r3]);

            expect(Result.isErr(actual)).toBe(true);
            if (Result.isErr(actual)) {
                // Type should be string (union of error types)
                const err: string = actual.data;
                expect(err).toBe('error message');
            }
        });

        it('should preserve readonly inner types while producing mutable tuple', () => {
            const readonlyArray: readonly number[] = [1, 2, 3];
            const r1 = Result.ok<readonly number[], string>(readonlyArray);
            const r2 = Result.ok<string, string>('hello');

            const actual = Result.flat([r1, r2]);

            if (Result.isOk(actual)) {
                // Compile-time check: inner readonly type is preserved
                const [arr, str]: [readonly number[], string] = actual.data;
                expect(arr).toEqual([1, 2, 3]);
                expect(str).toBe('hello');

                // This would fail to compile if readonly wasn't preserved:
                // arr.push(4); // Error: Property 'push' does not exist on type 'readonly number[]'

                // But the tuple itself is mutable (we can reassign indices):
                actual.data[1] = 'world';
                expect(actual.data[1]).toBe('world');
            }
        });
    });

    describe('tryCatch', () => {
        it('should return ok result if function does not throw', () => {
            const fn = () => 'abc';

            const result = Result.tryCatch(fn);
            expect(Result.isOk(result)).toEqual(true);
        });

        it('should return ok result if async function does not throw', async () => {
            const fn = async () => 'abc';

            const result = await Result.tryCatch(fn);
            expect(Result.isOk(result)).toEqual(true);
        });

        it('should return value if function does not throw', () => {
            const expected = 'abc';
            const fn = () => expected;

            const result = Result.tryCatch(fn);
            expect(result.data).toBe(expected);
        });

        it('should return value if async function does not throw', async () => {
            const expected = 'abc';
            const fn = async () => expected;

            const result = await Result.tryCatch(fn);
            expect(result.data).toBe(expected);
        });

        it('should return err result if function throws', () => {
            const fn = (): number => {
                throw new Error('abc');
            };

            const result = Result.tryCatch(fn);
            expect(Result.isErr(result)).toEqual(true);
        });

        it('should return err result if async function throws', async () => {
            const fn = async (): Promise<number> => {
                throw new Error('abc');
            };

            const result = await Result.tryCatch(fn);
            expect(Result.isErr(result)).toEqual(true);
        });

        it('should return thrown error if function throws', () => {
            const expected = new Error('abc');
            const fn = (): number => {
                throw expected;
            };

            const result = Result.tryCatch(fn);
            expect(result.data).toBe(expected);
        });

        it('should return thrown error if async function throws', async () => {
            const expected = new Error('abc');
            const fn = async (): Promise<number> => {
                throw expected;
            };

            const result = await Result.tryCatch(fn);
            expect(result.data).toBe(expected);
        });

        it('should return error if function throws non-error', () => {
            const fn = (): number => {
                throw 'abc';
            };

            const result = Result.tryCatch(fn);
            expect(result.data).toBeInstanceOf(Error);
        });

        it('should return error if async function throws non-error', async () => {
            const fn = async (): Promise<number> => {
                throw 'abc';
            };

            const result = await Result.tryCatch(fn);
            expect(result.data).toBeInstanceOf(Error);
        });
    });

    describe('optional', () => {
        it('should return value when is ok', () => {
            const value = 123;
            const result = Result.ok(value);

            const actual = Result.optional(result);
            expect(actual).toEqual(value);
        });

        it('should return undefined when is error', () => {
            const result = Result.err(123);

            const actual = Result.optional(result);
            expect(actual).toEqual(undefined);
        });
    });

    describe('optionalErr', () => {
        it('should return undefined when is ok', () => {
            const result = Result.ok(123);

            const actual = Result.optionalErr(result);
            expect(actual).toEqual(undefined);
        });

        it('should return undefined when is error', () => {
            const value = 123;
            const result = Result.err(value);

            const actual = Result.optionalErr(result);
            expect(actual).toEqual(value);
        });
    });
});
