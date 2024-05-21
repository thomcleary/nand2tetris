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
  readonly #kindCounts = new Map<string, number>();

  add(symbol: Omit<SymbolInfo<T>, "index">) {
    const kindCount = this.#kindCounts.get(symbol.kind) ?? 0;

    this.#kindCounts.set(symbol.kind, kindCount + 1);
    this.#table.set(symbol.name, { ...symbol, index: kindCount });
  }

  toString() {
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
