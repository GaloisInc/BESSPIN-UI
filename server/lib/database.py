"""
Database module
"""

import os
import json
import base64
import sqlite3
from uuid import uuid4
from datetime import datetime
from hashlib import sha3_256
import logging

log = logging.getLogger('lib.database')


# pylint: disable=invalid-name


# allow developers to specify a custom path to the directory for besspin data,
# falling back to XDG_DATA_HOME (or a hard-coded version of what that normally would be)
DB_PATH = os.environ.get(
    'DB_PATH',
    os.environ.get(
        'XDG_DATA_HOME',
        os.path.expanduser('~/.local/share')
    )
)
DB_PATH = os.path.abspath(os.path.join(DB_PATH, 'besspin'))
os.makedirs(DB_PATH, exist_ok=True)
DATABASE = os.path.join(DB_PATH, 'configurator.db')
SCHEMA_PATH = os.path.abspath(os.path.join(__file__, '..', '..', 'db', 'schema.sql'))

DB_INSERT = """INSERT INTO feature_models VALUES (?, ?, ?, ?, ?, ?, ?, ?);"""

DB_SELECT = """SELECT * FROM feature_models"""

DB_UPDATE = """UPDATE feature_models SET configs = :configs, last_update = :last_update WHERE uid = :uid"""

def initialize_db():
    """
    Initiliaze the database
    """
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    try:
        with open(SCHEMA_PATH) as f:
            db_schema = f.read()
            c.executescript(db_schema)
    except sqlite3.OperationalError as err:
        if 'already exists' not in str(err):
            raise RuntimeError('Ooops DB')
    finally:
        conn.close()

initialize_db()


def encode_json_db(content):
    """
    Encode a dict to a base64 encoded string for the db
    """
    return base64.b64encode(bytes(json.dumps(content), 'utf8')).decode()

def decode_json_db(content):
    """
    Decode data previously encoded into the db
    """
    return json.loads(base64.b64decode(content).decode())

def insert_feature_model_db(filename, source, conftree):
    """
    Insert feature mode in db

    :param filename:
    :param source: the source of the feature model
    :param conftree: configuration tree as fm.json

    :return: uid
    """
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    uid = str(uuid4())
    date = str(datetime.today().strftime("%Y-%m-%d %H:%M:%S"))
    thehash = str(sha3_256(bytes(source, 'utf8')))
    last_update = date
    c.execute(DB_INSERT, (
        uid,
        filename,
        source,
        encode_json_db(conftree),
        date,
        thehash,
        encode_json_db([]),
        last_update,
    ))
    conn.commit()
    conn.close()
    return uid

def update_configs_db(uid, cfgs):
    """
    Update configurations in db

    :param uid:
    :param cfgs:
    """
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    enc_cfgs = encode_json_db(cfgs)
    last_update = str(datetime.today().strftime("%Y-%m-%d %H:%M:%S"))
    c.execute(DB_UPDATE, {'uid': uid, 'configs': enc_cfgs, 'last_update': last_update})
    conn.commit()
    conn.close()

def retrieve_feature_models_db():
    """
    Retrieve feature model from db
    """
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute(DB_SELECT)
    entries = c.fetchall()
    conn.close()
    return entries

def uid_from_record(record):
    """
    returns the uid from a record
    """
    return record[0]

def filename_from_record(record):
    """
    returns the filemane from a record
    """
    return record[1]

def source_from_record(record):
    """
    returns the source from a record
    """
    return record[2]

def conftree_from_record(record):
    """
    returns the conftree from a record
    """
    return decode_json_db(record[3])

def date_from_record(record):
    """
    returns the date from a record
    """
    return record[4]

def configs_from_record(record):
    """
    returns the configs from a record
    """
    return decode_json_db(record[6])

def last_update_from_record(record):
    """
    returns the time of the last update from a record
    """
    last_update = '' if len(record) < 8 else record[7]
    return last_update

def retrieve_model_from_db_by_uid(uid):
    """
    Retrieve model from db by its uid
    """
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute(DB_SELECT)
    entries = c.fetchall()
    conn.close()
    for record in entries:
        if uid_from_record(record) == uid:
            return {
                'uid': uid_from_record(record),
                'filename': filename_from_record(record),
                'date': date_from_record(record),
                'source': source_from_record(record),
                'conftree': conftree_from_record(record),
                'configs': configs_from_record(record),
                'last_update': last_update_from_record(record),
            }
    return None


def record_to_info(record):
    """
    Transform a record into a dict with useful information
    """
    return {
        'filename': filename_from_record(record),
        'date': date_from_record(record),
        'uid': uid_from_record(record),
        'last_update': last_update_from_record(record),
        'nb_features_selected': len(configs_from_record(record)),
    }

def list_models_from_db():
    """
    List models in database
    """
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute(DB_SELECT)
    entries = c.fetchall()
    conn.close()
    list_models = [record_to_info(record) for record in entries]
    list_models.reverse()
    return list_models
