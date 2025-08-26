; Pressing 9 triggers the sequence
9::
    Send, +{w down}   ; Hold Shift+W down
    Sleep, 5000       ; Wait 5 seconds
    Send, +{w up}     ; Release Shift+W
	Send, {F11}       ; Press F11
    Send, ^+{Tab}     ; Ctrl+Shift+Tab (use this on Windows)
	Send, {F11}       ; Press F11
return
