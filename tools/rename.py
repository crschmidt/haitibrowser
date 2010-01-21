import sys
import os
dir = sys.argv[1]
files = os.listdir(dir)
files.sort()
for file in files:
    print file
    n = raw_input("North?")
    if not n:
        continue
    w = raw_input("West?")
    old_file = os.path.join(dir, file)
    new_file = os.path.join(dir, "%sN%sW_%s" % (n, w, file))
    os.rename(old_file, new_file)
    
