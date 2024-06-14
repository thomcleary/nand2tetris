import type { GrammarRule } from "../types/GrammarRule.js";
import type { Token } from "../types/Token.js";
import { escapeToken } from "../utils/testing.js";

export type JackParseTreeNodeValue = GrammarRule | Token;

export class JackParseTree {
  readonly root: JackParseTreeNode;

  constructor(root: JackParseTreeNodeValue) {
    this.root = new JackParseTreeNode(root);
  }

  toXmlString() {
    return this.root.toXmlString() + "\n";
  }
}

export class JackParseTreeNode {
  readonly value: JackParseTreeNodeValue;
  readonly children: JackParseTreeNode[];

  constructor(value: JackParseTreeNodeValue) {
    this.value = value;
    this.children = [];
  }

  insert(child: JackParseTreeNode | JackParseTreeNodeValue) {
    this.children.push(child instanceof JackParseTreeNode ? child : new JackParseTreeNode(child));
  }

  toXmlString({ depth = 0 }: { depth?: number } = {}): string {
    const lines: string[] = [];
    const indentation = "  ".repeat(depth);

    if (this.value.type === "grammarRule") {
      lines.push(`${indentation}<${this.value.rule}>`);
      lines.push(...this.children.flatMap((child) => child.toXmlString({ depth: depth + 1 })));
      lines.push(`${indentation}</${this.value.rule}>`);
    } else {
      lines.push(`${indentation}${`<${this.value.type}>`} ${escapeToken(this.value.token)} ${`</${this.value.type}>`}`);
    }

    return lines.join("\n");
  }
}

export default JackParseTree;
