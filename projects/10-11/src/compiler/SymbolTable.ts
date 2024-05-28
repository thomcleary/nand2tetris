import { Segment } from "../types/VmInstruction.js";

export type ClassSymbolKind = "field" | "static";
export type SubroutineSymbolKind = "arg" | "var";
export type SymbolKind = ClassSymbolKind | SubroutineSymbolKind;

type ClassSegment = Extract<Segment, "static" | "this">;
type SubroutineSegment = Extract<Segment, "argument" | "local">;
type VariableSegment = ClassSegment | SubroutineSegment;

export type SymbolInfo<T extends SymbolKind> = {
  name: string;
  type: string;
  kind: T;
  segment: VariableSegment;
  index: number;
};

export class SymbolTable<T extends SymbolKind> {
  readonly #table = new Map<string, SymbolInfo<T>>();
  readonly #kindCounts = new Map<T, number>();

  clear(): void {
    this.#table.clear();
    this.#kindCounts.clear();
  }

  add({ name, type, kind }: Omit<SymbolInfo<T>, "index" | "segment">): void {
    if (!name || !type || !kind) {
      throw new Error(`[SymbolTable.add] Invalid symbol - { name: ${name}, type: ${type}, kind: ${kind} }`);
    }

    const kindCount = this.#kindCounts.get(kind) ?? 0;

    this.#kindCounts.set(kind, kindCount + 1);
    this.#table.set(name, { name, type, kind, index: kindCount, segment: this.#getSegment(kind) });
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

  #getSegment(kind: SymbolKind): VariableSegment {
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
