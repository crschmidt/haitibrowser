#!/usr/bin/python
import csv
import sqlite3
import sys

file = csv.reader(open(sys.argv[1]), delimiter="\t")
out = sys.argv[2]
header = None
db = sqlite3.connect(out)
cur = db.cursor()

for row in file:
    if not header:
        header = row
        sql = "CREATE TABLE csv ("
        sql += (",\n".join(
            map(lambda x: "%s varchar" % x, header)))
        sql += ");"    
        cur.execute(sql)         
    sql = "INSERT INTO csv VALUES ("
    sql += (", ".join(
            map(lambda x: "?", header)))
    sql += ");"        
    cur.execute(sql, map(lambda x: x.decode("utf-8"), row))         
db.commit()        
