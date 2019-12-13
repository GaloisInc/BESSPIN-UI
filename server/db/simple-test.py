import csv, sqlite3
from sqlalchemy import (
    create_engine,
    select,
    text,
    Table,
    MetaData
)

def create_db(conn):
    with open('./schema.sql', 'r') as f:
        schema = f.read()
        conn.executescript(schema)
        conn.commit()

def load_csv(conn, table_name, csv_filename):
    print(csv.list_dialects())
    with open(f'./test-data/{csv_filename}.csv', 'r') as f:
        dr = csv.DictReader(f, quoting=csv.QUOTE_NONNUMERIC)
        fieldnames = ','.join(dr.fieldnames)
        placeholders = ','.join(['?' for f in dr.fieldnames])
        for i in dr:
            data = [d for d in i.values()]
            print(data)
            conn.execute(f'INSERT INTO {table_name} ({fieldnames}) VALUES ({placeholders});', data)
            conn.commit()

def run_query(conn, query):
    results = conn.execute(query)

    for row in results:
        print(row)
    
    results.close()

def inspect_table(meta, engine, conn, table_name):
    try:
        table_def = Table(table_name, meta, autoload=True, autoload_with=engine)
        query = select([table_def])
        run_query(conn, query)
    except Exception as inst:
        print(inst)

# change the ':memory:' to a file if you'd like to keep the data around for further testing
engine = create_engine(f'sqlite:///:memory:', echo=True)
conn = engine.connect()
meta = MetaData()

table_names = [
    'jobStatus',
    'versionedResources',
    'versionedResourceType',
    'architectureModels',
    'featureModels',
    'featureConfigurations',
    'vulnerabilityConfigurations',
    'systemConfigurations',
    'testRuns',
    'jobStatus',
    'jobs'
]

connection = conn.connection

create_db(connection)
load_csv(connection, 'jobs', 'job')
load_csv(connection, 'versionedResources', 'versioned-resource')
load_csv(connection, 'architectureModelInputs', 'arch-model')
load_csv(connection, 'architectureExtractionJobs', 'arch-job')
load_csv(connection, 'featureModelInputs', 'feat-model')
load_csv(connection, 'featureExtractionJobs', 'feat-model-job')
load_csv(connection, 'systemConfigurationInputs', 'sys-config')
load_csv(connection, 'systemConfigurationJobs', 'sys-job')

for table_name in table_names:
    inspect_table(meta, engine, conn, table_name)

with open('./test-queries/fetch-sys-config-grid-data.sql') as f:
    query = f.read()
    result = conn.execute(text(query))
    for row in result:
        print(row)