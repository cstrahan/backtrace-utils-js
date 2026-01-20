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
    });

    describe('match', () => {
        it('should call onOk callback for ok result', () => {
            const result = Result.ok<number, string>(42);

            const actual = Result.match(
                result,
                (data) => `success: ${data}`,
                (err) => `error: ${err}`,
            );

            expect(actual).toBe('success: 42');
        });

        it('should call onErr callback for err result', () => {
            const result = Result.err<string, number>('something went wrong');

            const actual = Result.match(
                result,
                (data) => `success: ${data}`,
                (err) => `error: ${err}`,
            );

            expect(actual).toBe('error: something went wrong');
        });

        it('should handle async onOk callback', async () => {
            const result = Result.ok<number, string>(42);

            const actual = await Result.match(
                result,
                async (data) => `success: ${data}`,
                async (err) => `error: ${err}`,
            );

            expect(actual).toBe('success: 42');
        });

        it('should handle async onErr callback', async () => {
            const result = Result.err<string, number>('failed');

            const actual = await Result.match(
                result,
                async (data) => `success: ${data}`,
                async (err) => `error: ${err}`,
            );

            expect(actual).toBe('error: failed');
        });

        it('should return different types based on callbacks', () => {
            const okResult = Result.ok<number, string>(10);
            const errResult = Result.err<string, number>('error');

            const okActual = Result.match(
                okResult,
                (data) => data * 2,
                () => -1,
            );

            const errActual = Result.match(
                errResult,
                (data) => data * 2,
                () => -1,
            );

            expect(okActual).toBe(20);
            expect(errActual).toBe(-1);
        });
    });

    describe('curried match', () => {
        it('should work with pipe for ok result', () => {
            const result = Result.ok<number, string>(42);

            const actual = pipe(
                result,
                Result.match(
                    (data) => `success: ${data}`,
                    (err) => `error: ${err}`,
                ),
            );

            expect(actual).toBe('success: 42');
        });

        it('should work with pipe for err result', () => {
            const result = Result.err<string, number>('failed');

            const actual = pipe(
                result,
                Result.match(
                    (data) => `success: ${data}`,
                    (err) => `error: ${err}`,
                ),
            );

            expect(actual).toBe('error: failed');
        });

        it('should work with pipe for async callbacks', async () => {
            const result = Result.ok<number, string>(42);

            const actual = await pipe(
                result,
                Result.match(
                    async (data) => `success: ${data}`,
                    async (err) => `error: ${err}`,
                ),
            );

            expect(actual).toBe('success: 42');
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
