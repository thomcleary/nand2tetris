const XmlConflicts = {
  "<": "&lt;",
  ">": "&gt;",
  [`"`]: "&quot;",
  "&": "&amp;",
} as const satisfies Record<"<" | ">" | '"' | "&", `&${string};`>;

export const isXmlConflict = (token: string): token is keyof typeof XmlConflicts =>
  Object.keys(XmlConflicts).includes(token);

export const escapeToken = (token: string) => (isXmlConflict(token) ? XmlConflicts[token] : token);
