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


# pylint: disable=invalid-name

XDG_DATA_HOME = os.environ.get('XDG_DATA_HOME') or os.path.expanduser('~/.local/share')
BESSPIN_DATA_HOME = os.path.join(XDG_DATA_HOME, 'besspin')
os.makedirs(BESSPIN_DATA_HOME, exist_ok=True)
DATABASE = os.path.join(BESSPIN_DATA_HOME, 'configurator.db')

DB_SCHEMA = '''
CREATE TABLE
  feature_models (
    uid text,
    filename text,
    source text,
    conftree text,
    date text,
    hash text,
    configs text
);
'''

DB_INSERT = """INSERT INTO feature_models VALUES (?, ?, ?, ?, ?, ?, ?);"""

DB_SELECT = """SELECT * FROM feature_models"""

DB_UPDATE = """UPDATE feature_models SET configs = :config WHERE uid = :uid"""

def initialize_db():
    """
    Initiliaze the database
    """
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    try:
        c.execute(DB_SCHEMA)
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

def insert_feature_model_db(filename, content, conftree):
    """
    Insert feature mode in db

    :param filename:
    :param content:

    :return: uid
    """
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    uid = str(uuid4())
    date = str(datetime.today())
    thehash = str(sha3_256(bytes(content, 'utf8')))
    c.execute(DB_INSERT, (
        uid,
        filename,
        content,
        encode_json_db(conftree),
        date,
        thehash,
        encode_json_db([])
    ))
    conn.commit()
    conn.close()
    return uid

def update_config_db(uid, cfg):
    """
    Insert feature mode in db

    :param filename:
    :param content:
    """
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    enc_cfg = encode_json_db(cfg)
    c.execute(DB_UPDATE, {'uid': uid, 'config': enc_cfg})
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
                'source': source_from_record(record),
                'conftree': conftree_from_record(record),
                'configs': configs_from_record(record),
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
    return list_models
