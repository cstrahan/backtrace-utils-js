import { KIND, Kind, Map, MaybePromise } from './common';
import { ensureError } from './error';

export class UnwrapError<E> extends Error {
    constructor(public readonly data: E) {
        super('Operation has resulted in an error.');
    }
}

export interface ResultOk<T> extends Kind<'result_ok'> {
    readonly data: T;
}

export interface ResultErr<T> extends Kind<'result_err'> {
    readonly data: T;
}

export type Result<T, E> = ResultOk<T> | ResultErr<E>;
export type ResultPromise<T, E> = Promise<Result<T, E>>;

class ResultFunctions {
    public static ok<T, E = never>(data: T): Result<T, E> {
        return { data, [KIND]: 'result_ok' };
    }

    public static void<E = never>(): Result<void, E> {
        return { data: undefined, [KIND]: 'result_ok' };
    }

    public static err<E, T = never>(data: E): Result<T, E> {
        return { data, [KIND]: 'result_err' };
    }

    public static isResult<T, E>(value: unknown): value is Result<T, E> {
        return typeof value === 'object' && !!value && (value[KIND] === 'result_ok' || value[KIND] === 'result_err');
    }

    public static isOk<T>(result: Result<T, unknown>): result is ResultOk<T> {
        return result[KIND] === 'result_ok';
    }

    public static isErr<E>(result: Result<unknown, E>): result is ResultErr<E> {
        return result[KIND] === 'result_err';
    }

    public static wrapOk<T, E>(data: T | Result<T, E>): Result<T, E> {
        if (ResultFunctions.isResult(data)) {
            return data;
        }

        return ResultFunctions.ok(data);
    }

    public static wrapErr<T, E>(data: E | Result<T, E>): Result<T, E> {
        if (ResultFunctions.isResult(data)) {
            return data;
        }

        return ResultFunctions.err(data);
    }

    public static unwrap<T>(result: Result<T, unknown>): T {
        if (ResultFunctions.isErr(result)) {
            if (result.data instanceof Error) {
                throw result.data;
            }

            throw new UnwrapError(result.data);
        }
        return result.data;
    }

    public static map<T, E, N>(
        transform: Map<T, Promise<Result<N, E>>>,
    ): (result: Result<T, E>) => Promise<Result<N, E>>;
    public static map<T, E, N>(transform: Map<T, Result<N, E>>): (result: Result<T, E>) => Result<N, E>;
    public static map<T, E, N>(transform: Map<T, Promise<T>>): (result: Result<T, E>) => Promise<Result<N, E>>;
    public static map<T, E, N>(transform: Map<T, N>): (result: Result<T, E>) => Result<N, E>;
    public static map<T, E, N>(
        transform: Map<T, MaybePromise<N> | MaybePromise<Result<N, E>>>,
    ): (result: Result<T, E>) => MaybePromise<Result<N, E>>;
    public static map<T, E, N>(result: Result<T, E>, transform: Map<T, Promise<Result<N, E>>>): Promise<Result<N, E>>;
    public static map<T, E, N>(result: Result<T, E>, transform: Map<T, Result<N, E>>): Result<N, E>;
    public static map<T, E, N>(result: Result<T, E>, transform: Map<T, Promise<N>>): Promise<Result<N, E>>;
    public static map<T, E, N>(result: Result<T, E>, transform: Map<T, N>): Result<N, E>;
    public static map<T, E, N>(
        result: Result<T, E>,
        transform: Map<T, MaybePromise<N> | MaybePromise<Result<N, E>>>,
    ): MaybePromise<Result<N, E>>;
    public static map<T, E, N>(
        resultOrTransform: Result<T, E> | Map<T, MaybePromise<N> | MaybePromise<Result<N, E>>>,
        transform?: Map<T, MaybePromise<N> | MaybePromise<Result<N, E>>>,
    ): MaybePromise<Result<N, E>> | ((result: Result<T, E>) => MaybePromise<Result<N, E>>) {
        const map = (result: Result<T, E>, transform: Map<T, MaybePromise<N> | MaybePromise<Result<N, E>>>) => {
            if (ResultFunctions.isErr(result)) {
                return result;
            }

            if (!transform) {
                throw new Error('transform must be provided');
            }

            const maybePromise = transform(result.data);
            if (maybePromise instanceof Promise) {
                return maybePromise.then(ResultFunctions.wrapOk<N, E>);
            }
            return ResultFunctions.wrapOk(maybePromise);
        };

        if (typeof resultOrTransform === 'function') {
            return (result: Result<T, E>) => map(result, resultOrTransform);
        }

        if (!transform) {
            throw new Error('transform must be provided');
        }

        return map(resultOrTransform, transform);
    }

    public static mapErr<T, E, N>(
        transform: Map<E, Promise<Result<T, N>>>,
    ): (result: Result<T, E>) => Promise<Result<T, N>>;
    public static mapErr<T, E, N>(transform: Map<E, Result<T, N>>): (result: Result<T, E>) => Result<T, N>;
    public static mapErr<T, E, N>(transform: Map<E, Promise<N>>): (result: Result<T, E>) => Promise<Result<T, N>>;
    public static mapErr<T, E, N>(transform: Map<E, N>): (result: Result<T, E>) => Result<T, N>;
    public static mapErr<T, E, N>(
        transform: Map<E, MaybePromise<N> | MaybePromise<Result<T, N>>>,
    ): (result: Result<T, E>) => MaybePromise<Result<T, N>>;
    public static mapErr<T, E, N>(
        result: Result<T, E>,
        transform: Map<E, Promise<Result<T, N>>>,
    ): Promise<Result<T, N>>;
    public static mapErr<T, E, N>(result: Result<T, E>, transform: Map<E, Result<T, N>>): Result<T, N>;
    public static mapErr<T, E, N>(result: Result<T, E>, transform: Map<E, Promise<N>>): Promise<Result<T, N>>;
    public static mapErr<T, E, N>(result: Result<T, E>, transform: Map<E, N>): Result<T, N>;
    public static mapErr<T, E, N>(
        result: Result<T, E>,
        transform: Map<E, MaybePromise<N> | MaybePromise<Result<T, N>>>,
    ): MaybePromise<Result<T, N>>;
    public static mapErr<T, E, N>(
        resultOrTransform: Result<T, E> | Map<E, MaybePromise<N> | MaybePromise<Result<T, N>>>,
        transform?: Map<E, MaybePromise<N> | MaybePromise<Result<T, N>>>,
    ): MaybePromise<Result<T, N>> | ((result: Result<T, E>) => MaybePromise<Result<T, N>>) {
        const mapErr = (result: Result<T, E>, transform: Map<E, MaybePromise<N> | MaybePromise<Result<T, N>>>) => {
            if (ResultFunctions.isOk(result)) {
                return result;
            }

            const maybePromise = transform(result.data);
            if (maybePromise instanceof Promise) {
                return maybePromise.then(ResultFunctions.wrapErr<T, N>);
            }

            return ResultFunctions.wrapErr(maybePromise);
        };

        if (typeof resultOrTransform === 'function') {
            return (result: Result<T, E>) => mapErr(result, resultOrTransform);
        }

        if (!transform) {
            throw new Error('transform must be provided');
        }

        return mapErr(resultOrTransform, transform);
    }

    public static flat<T, E>(results: Result<T, E>[]): Result<T[], E> {
        const data: T[] = [];
        for (const result of results) {
            if (ResultFunctions.isErr(result)) {
                return result;
            }

            data.push(result.data);
        }

        return ResultFunctions.ok(data);
    }

    public static match<T, E, R>(
        onOk: Map<T, Promise<R>>,
        onErr: Map<E, Promise<R>>,
    ): (result: Result<T, E>) => Promise<R>;
    public static match<T, E, R>(onOk: Map<T, R>, onErr: Map<E, R>): (result: Result<T, E>) => R;
    public static match<T, E, R>(
        onOk: Map<T, MaybePromise<R>>,
        onErr: Map<E, MaybePromise<R>>,
    ): (result: Result<T, E>) => MaybePromise<R>;
    public static match<T, E, R>(result: Result<T, E>, onOk: Map<T, Promise<R>>, onErr: Map<E, Promise<R>>): Promise<R>;
    public static match<T, E, R>(result: Result<T, E>, onOk: Map<T, R>, onErr: Map<E, R>): R;
    public static match<T, E, R>(
        result: Result<T, E>,
        onOk: Map<T, MaybePromise<R>>,
        onErr: Map<E, MaybePromise<R>>,
    ): MaybePromise<R>;
    public static match<T, E, R>(
        resultOrOnOk: Result<T, E> | Map<T, MaybePromise<R>>,
        onOkOrOnErr: Map<T, MaybePromise<R>> | Map<E, MaybePromise<R>>,
        onErr?: Map<E, MaybePromise<R>>,
    ): MaybePromise<R> | ((result: Result<T, E>) => MaybePromise<R>) {
        const match = (result: Result<T, E>, onOk: Map<T, MaybePromise<R>>, onErr: Map<E, MaybePromise<R>>) => {
            if (ResultFunctions.isOk(result)) {
                return onOk(result.data);
            }
            return onErr(result.data);
        };

        if (typeof resultOrOnOk === 'function') {
            const onOk = resultOrOnOk;
            const onErrFn = onOkOrOnErr as Map<E, MaybePromise<R>>;
            return (result: Result<T, E>) => match(result, onOk, onErrFn);
        }

        if (!onErr) {
            throw new Error('onErr must be provided');
        }

        return match(resultOrOnOk, onOkOrOnErr as Map<T, MaybePromise<R>>, onErr);
    }

    public static tryCatch<T>(fn: () => Promise<T>): Promise<Result<T, Error>>;
    public static tryCatch<T>(fn: () => T): Result<T, Error>;
    public static tryCatch<T>(fn: () => MaybePromise<T>): MaybePromise<Result<T, Error>> {
        try {
            const result = fn();
            if (result instanceof Promise) {
                return result.then(Result.ok).catch((reason) => Result.err(ensureError(reason)));
            }
            return Result.ok(result);
        } catch (err) {
            return Result.err(ensureError(err));
        }
    }

    public static tryCatchUnknown<T>(fn: () => Promise<T>): Promise<Result<T, unknown>>;
    public static tryCatchUnknown<T>(fn: () => T): Result<T, unknown>;
    public static tryCatchUnknown<T>(fn: () => MaybePromise<T>): MaybePromise<Result<T, unknown>> {
        try {
            const result = fn();
            if (result instanceof Promise) {
                return result.then(Result.ok).catch(Result.err);
            }
            return Result.ok(result);
        } catch (err) {
            return Result.err(err);
        }
    }

    public static optional<T, E = never>(result: Result<T, E>): T | undefined {
        return Result.mapErr(result, () => undefined).data;
    }

    public static optionalErr<E, T = never>(result: Result<T, E>): E | undefined {
        return Result.map(result, () => undefined).data;
    }
}

export const Result = ResultFunctions;
