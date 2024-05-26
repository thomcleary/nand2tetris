export type Result<
  S extends Record<PropertyKey, unknown>,
  F extends Record<PropertyKey, unknown> = { message: string }
> = ({ success: true } & S) | ({ success: false } & F);

export type Split<T extends string, S extends string = never> = T extends `${infer Head}${infer Tail}`
  ? S | Head | Split<Tail>
  : S;
