export type Result<T extends Record<PropertyKey, unknown>> =
  | ({ success: true } & T)
  | { success: false; message: string };

export type Token = {};
