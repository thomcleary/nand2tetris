import { JackParseTreeNode, Tree, TreeNode } from "./types.js";

export class JackParseTree implements Tree<JackParseTreeNode> {
  public root: TreeNode<JackParseTreeNode>;

  constructor(rootValue: JackParseTreeNode) {
    this.root = { value: rootValue, children: [] };
  }

  insert(value: JackParseTreeNode | JackParseTree | JackParseTree[]) {
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
}

export default JackParseTree;
