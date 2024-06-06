export type Result<
	S extends Record<PropertyKey, unknown>,
	F extends Record<PropertyKey, unknown> = { message: string }
> = ({ success: true } & S) | ({ success: false } & F);
