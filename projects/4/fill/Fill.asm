// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/Fill.asm

// Runs an infinite loop that listens to the keyboard input. 
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel. When no key is pressed, 
// the screen should be cleared.

(LOOP)
@SCREEN
D=A
@currentScreenWord
M=D

@KBD
D=M
@BLACK
D;JGT

@colour
M=0 // WHITE
@FILL
0;JMP

(BLACK)
@colour
M=-1

(FILL)
@colour
D=M
@currentScreenWord
A=M
M=D
@currentScreenWord
M=M+1
D=M
@KBD
D=D-A
@FILL
D;JLT
@LOOP
0;JMP