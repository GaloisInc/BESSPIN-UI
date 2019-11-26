import sqlite3

conn = sqlite3.connect(':memory:')
c = conn.cursor()

try:
    print('loading schema...')
    with open('./schema.sql') as f:
        db_schema = f.read()
        c.executescript(db_schema)
    
    print('loading data...')
    with open('./test-data.sql') as f:
        db_inserts = f.read()
        c.executescript(db_inserts)
    
    print('running sample queries...')
    with open('./sample-queries.sql') as f:
        dbQueries = f.read().splitlines()
        for query in dbQueries:
            if query.startswith('--'):
                print('running queries "' + query.replace('--', '') + '" queries')
            elif not query.isspace():
                c.execute(query)
                for row in c.fetchall():
                    print(row)
except Exception as err:
    print('Unexpected error:', err)
finally:
    conn.close()
