export type ClassSymbolKind = "field" | "static";
export type SubroutineSymbolKind = "arg" | "var";
export type SymbolKind = ClassSymbolKind | SubroutineSymbolKind;

export type ClassSegment = "static" | "this";
export type SubroutineSegment = "argument" | "local";
export type Segment = ClassSegment | SubroutineSegment;

export type SymbolInfo<T extends SymbolKind> = {
  name: string;
  type: string;
  kind: T;
  segment: Segment;
  index: number;
};

export class SymbolTable<T extends SymbolKind> {
  readonly #table = new Map<string, SymbolInfo<T>>();
  readonly #kindCounts = new Map<T, number>();

  clear(): void {
    this.#table.clear();
    this.#kindCounts.clear();
  }

  add(symbol: Omit<SymbolInfo<T>, "index" | "segment">): void {
    const kindCount = this.#kindCounts.get(symbol.kind) ?? 0;

    this.#kindCounts.set(symbol.kind, kindCount + 1);
    this.#table.set(symbol.name, { ...symbol, index: kindCount, segment: this.#getSegment(symbol.kind) });
  }

  has(name: string): boolean {
    return this.#table.has(name);
  }

  get(name: string): SymbolInfo<T> | undefined {
    return this.#table.get(name);
  }

  count(kind: T): number {
    return this.#kindCounts.get(kind) ?? 0;
  }

  #getSegment(kind: SymbolKind): Segment {
    switch (kind) {
      case "static":
        return "static";
      case "field":
        return "this";
      case "arg":
        return "argument";
      case "var":
        return "local";
    }
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

export default SymbolTable;
