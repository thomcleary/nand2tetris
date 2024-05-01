import { JackParseTreeNodeValue, Tree, TreeNode } from "./types.js";

export class JackParseTree implements Tree<JackParseTreeNodeValue> {
  public root: TreeNode<JackParseTreeNodeValue>;

  constructor(rootValue: JackParseTreeNodeValue) {
    this.root = { value: rootValue, children: [] };
  }

  insert(value: JackParseTreeNodeValue | JackParseTree): JackParseTree {
    if (value instanceof JackParseTree) {
      this.root.children.push(value);
      return value;
    }

    const tree = new JackParseTree(value);

    this.root.children.push(tree);

    return tree;
  }
}
