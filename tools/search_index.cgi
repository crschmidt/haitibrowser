#!/usr/bin/python
import sys
import cgi
import sqlite3
db = sqlite3.connect("index.db")
cur = db.cursor()
fs = cgi.FieldStorage()
grid = fs["grid"].value
if not grid:
    print "Content-Type: text/plain"
    print
    sys.exit()
if not " " in grid:
    grid = grid[0:3] + " " + grid[3:5] + " " + grid[5:]
cur.execute("SELECT * FROM csv WHERE MGRS=?", [grid]) 
print "Content-Type: text/plain"
print
print cur.fetchall()
