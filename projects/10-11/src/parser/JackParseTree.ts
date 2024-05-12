import { escapeToken } from "../utils/testing.js";
import { JackParseTreeNode, ParseTree, ParseTreeNode } from "./types.js";

export class JackParseTree implements ParseTree<JackParseTreeNode> {
  public root: ParseTreeNode<JackParseTreeNode>;

  constructor(rootValue: JackParseTreeNode) {
    this.root = { value: rootValue, children: [] };
  }

  public insert(value: JackParseTreeNode | JackParseTree | JackParseTree[]) {
    if (value instanceof JackParseTree) {
      this.root.children.push(value);
      return value;
    }

    if (value instanceof Array) {
      this.root.children.push(...value);
      return value;
    }

    const tree = new JackParseTree(value);
    this.root.children.push(tree);
    return;
  }

  public toXmlString({ depth = 0 }: { depth?: number } = {}): string {
    const lines: string[] = [];

    const { value } = this.root;
    const indentation = "  ".repeat(depth);

    if (value.type === "grammarRule") {
      lines.push(`${indentation}<${value.rule}>`);
      lines.push(...this.root.children.flatMap((child) => child.toXmlString({ depth: depth + 1 })));
      lines.push(`${indentation}</${value.rule}>`);
    } else {
      lines.push(`${indentation}${`<${value.type}>`} ${escapeToken(value.token)} ${`</${value.type}>`}`);
    }

    return lines.join("\n");
  }
}

export default JackParseTree;
