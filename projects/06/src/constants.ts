export const PREDEFINED_SYMBOLS = {
  R0: 0,
  R1: 1,
  R2: 2,
  R3: 3,
  R4: 4,
  R5: 5,
  R6: 6,
  R7: 7,
  R8: 8,
  R9: 9,
  R10: 10,
  R11: 11,
  R12: 12,
  R13: 13,
  R14: 14,
  R15: 15,
  SP: 0,
  LCL: 1,
  ARG: 2,
  THIS: 3,
  THAT: 4,
  SCREEN: 16384,
  KBD: 24576,
} as const;

export const VARIABLE_ADDRESS_START = 16;

export const C_INSTRUCTION_PREFIX = 0b1110_0000_0000_0000;
export const MEMORY_COMP_CODE = 0b0001_0000_0000_0000;

export const DEST_CODES = {
  A: 0b10_0000,
  D: 0b01_0000,
  M: 0b00_1000,
} as const;

export const COMP_CODES = {
  "0": 0b1010_1000_0000,
  "1": 0b1111_1100_0000,
  "-1": 0b1110_1000_0000,
  D: 0b0011_0000_0000,
  A: 0b1100_0000_0000,
  M: 0b1100_0000_0000,
  "!D": 0b0011_0100_0000,
  "!A": 0b1100_0100_0000,
  "!M": 0b1100_0100_0000,
  "-D": 0b0011_1100_0000,
  "-A": 0b1100_1100_0000,
  "-M": 0b1100_1100_0000,
  "D+1": 0b0111_1100_0000,
  "A+1": 0b1101_1100_0000,
  "M+1": 0b1101_1100_0000,
  "D-1": 0b0011_1000_0000,
  "A-1": 0b1100_1000_0000,
  "M-1": 0b1100_1000_0000,
  "D+A": 0b0000_1000_0000,
  "A+D": 0b0000_1000_0000,
  "D+M": 0b0000_1000_0000,
  "M+D": 0b0000_1000_0000,
  "D-A": 0b0100_1100_0000,
  "A-D": 0b0001_1100_0000,
  "D-M": 0b0100_1100_0000,
  "M-D": 0b0001_1100_0000,
  "D&A": 0b0000_0000_0000,
  "A&D": 0b0000_0000_0000,
  "D&M": 0b0000_0000_0000,
  "M&D": 0b0000_0000_0000,
  "D|A": 0b0101_0100_0000,
  "A|D": 0b0101_0100_0000,
  "D|M": 0b0101_0100_0000,
  "M|D": 0b0101_0100_0000,
} as const;

export const JUMP_CODES = {
  JGT: 0b001,
  JEQ: 0b010,
  JGE: 0b011,
  JLT: 0b100,
  JNE: 0b101,
  JLE: 0b110,
  JMP: 0b111,
} as const;
