export type ClassSymbolKind = "field" | "static";
export type SubroutineSymbolKind = "arg" | "var";

export type SymbolInfo<T extends string> = {
  name: string;
  kind: T;
  type: string;
  index: number;
};

export class SymbolTable<T extends string> {
  readonly #table = new Map<string, SymbolInfo<T>>();
  readonly #kindCounts = new Map<T, number>();

  clear(): void {
    this.#table.clear();
    this.#kindCounts.clear();
  }

  add(symbol: Omit<SymbolInfo<T>, "index">): void {
    const kindCount = this.#kindCounts.get(symbol.kind) ?? 0;

    this.#kindCounts.set(symbol.kind, kindCount + 1);
    this.#table.set(symbol.name, { ...symbol, index: kindCount });
  }

  count(kind: T): number {
    return this.#kindCounts.get(kind) ?? 0;
  }

  toString(): string {
    let str = "";

    if (this.#table.size === 0) {
      return "Empty";
    }

    this.#table.forEach(
      ({ name, kind, type, index }) =>
        (str = str + `{ name: ${name}, kind: ${kind}, type: ${type}, index: ${index} }\n`)
    );

    return str;
  }
}
