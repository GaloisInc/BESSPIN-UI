"""
A feature model configurator web app
"""
import os
import logging
import json
import subprocess
import tempfile
from uuid import uuid4
from datetime import datetime
import sqlite3
from hashlib import sha3_256
from flask import Flask
from flask import request
from flask.logging import default_handler

# pylint: disable=invalid-name
# pylint: disable=no-member


CODE_DIR = os.path.dirname(__file__)

if os.environ.get('BESSPIN_CONFIGURATOR_USE_TEMP_DIR'):
    WORK_DIR_OBJ = tempfile.TemporaryDirectory()
    WORK_DIR = WORK_DIR_OBJ.name
else:
    WORK_DIR = '.'

CLAFER = os.environ.get('BESSPIN_CLAFER', 'clafer')


app = Flask(__name__)

default_handler.setLevel(logging.DEBUG)


XDG_DATA_HOME = os.environ.get('XDG_DATA_HOME') or os.path.expanduser('~/.local/share')
BESSPIN_DATA_HOME = os.path.join(XDG_DATA_HOME, 'besspin')
os.makedirs(BESSPIN_DATA_HOME, exist_ok=True)
DATABASE = os.path.join(BESSPIN_DATA_HOME, 'configurator.db')

SCHEMA = '''
CREATE TABLE
  feature_models (
    uid text,
    filename text,
    source text,
    date text,
    hash text,
    configs text
);
'''

INSERT = """INSERT INTO feature_models VALUES ("{}", "{}", "{}", "{}", "{}", "{}");"""

def initialize_db():
    """
    Initiliaze the database
    """
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    try:
        c.execute(SCHEMA)
    except sqlite3.OperationalError as err:
        if 'already exists' not in str(err):
            raise RuntimeError('Ooops DB')
    finally:
        conn.close()

initialize_db()

def insert_feature_model_db(filename, content):
    """
    Insert feature mode in db

    :param filename:
    :param content:
    """
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    uid = str(uuid4())
    date = str(datetime.today())
    thehash = str(sha3_256(bytes(content, 'utf8')))
    query = INSERT.format(uid, filename, content, date, thehash, json.dumps([]))
    c.execute(query)
    conn.commit()
    conn.close()

def retrieve_feature_models_db():
    """
    Retrieve feature model from db
    """
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute("SELECT * FROM feature_models")
    entries = c.fetchall()
    conn.close()
    return entries

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

def retrieve_model_from_db(file_identifier):
    """
    Retrieve model from db
    """

    # TODO: for now the file_identifier is the filename
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute("SELECT * FROM feature_models")
    entries = c.fetchall()
    conn.close()
    for record in entries:
        if filename_from_record(record) == file_identifier:
            return source_from_record(record) # the text
    return None

class ClaferModule:
    """
    A class providing functionalities for processing
    """

    def __init__(self, module):
        self.module = module


    def to_conftree(self):
        """
        Convert to ConfTree.

        :return: Tree
        """
        # TODO: deprecated!! Should cleanup when ready
        # get to the list of declarations:
        content = self.module['iModule']
        decls = content['mDecls']

        # start the traversal
        group = [iclafer_to_conftree(elm) for elm in decls]
        return ConfTree(ident='Module', uid='Module', group=group)

    def unfold_product(self, prod):
        """
        Unfold a product in a model
        """

        iclafer = prod['iClafer']

        if 'super' in iclafer and not iclafer['elements']:
            # notice it could also be ['super']['exp']['binding']
            assert iclafer['super']['exp']['isTop'] is True
            abstract = self.find_uid(iclafer['super']['exp']['sident'])
            iclafer['elements'] = abstract['iClafer']['elements'] if abstract is not None else []

        return prod

    @classmethod
    def _find_uid_in_elements(cls, uid, elements):
        for elem in elements:
            res = cls._find_uid_in_content(uid, elem)
            if res is not None:
                return res
        return None

    @classmethod
    def _find_uid_in_content(cls, uid, content):
        if 'iClafer' not in content:
            return None
        app.logger.debug(content)
        iclafer = content['iClafer']
        node_uid = iclafer['uid']

        if uid == node_uid:
            return content
        elements = iclafer['elements']
        return cls._find_uid_in_elements(uid, elements)

    def find_uid(self, uid):
        """
        find a clafer by its uid
        """
        elements = self.module['iModule']['mDecls']

        return self._find_uid_in_elements(uid, elements)


    def find_products(self):
        """
        Find products in a clafer module.
        Currently, a product is defined as a non-abstract clafer.

        :return: a list of clafer object that are not abstract
        """
        decls = self.module['iModule']['mDecls']
        res = []
        for decl in decls:
            if decl['tag'] == 'IEClafer':
                assert isinstance(decl['iClafer']['modifiers']['abstract'], bool)
                if not decl['iClafer']['modifiers']['abstract']:
                    res += [decl]
            else:
                assert decl['tag'] == 'IEConstraint'
        return res


    def build_conftree(self):
        """
        Build a Config Tree from a model

        :return: Tree
        """
        prods = self.find_products()
        nb_prods = len(prods)
        # pylint: disable=no-else-return
        if nb_prods == 0:
            return None
        elif nb_prods == 1:
            prod = prods[0]
            prod = self.unfold_product(prod)
            return iclafer_to_conftree(prod)
        else: # > 1
            prods = [iclafer_to_conftree(prod) for prod in prods]
            t = ConfTree(
                ident='Features',
                uid=str(uuid4()),
                card=[1, 1],
                group_card=[0, -1],
                group=prods,
            )
            return t

FORCEDON = 'FORCEDON'
FORCEDOFF = 'FORCEDOFF'
USERSELECTED = 'USERSELECTED'
USERREJECTED = 'USERREJECTED'
UNCONFIGURED = 'UNCONFIGURED'

class ConfTree:
    """
    A tree data-structure for a Configuration Feature Model.
    """

    def __init__(
            self,
            uid='dummy_uid',
            ident='dummy_ident',
            itype=None,
            card=None,
            group_card=None,
            group=None,
    ):
        self.uid = uid # unique id
        self.ident = ident # a name
        self.itype = itype # the type of the Node
        self.selection_state = self._compute_state(card) # from Hari
        self.card = card # [0..1], [1..1], [0..*], etc.
        self.group_card = group_card # or [1..*], xor, [1..1]
        self.group = group # a list of ConfTree

    @classmethod
    def _compute_state(cls, card):
        """
        Compute selection state
        """
        # pylint: disable=no-else-return
        if card == [1, 1]:
            return FORCEDON
        if card == [0, 0]:
            return FORCEDOFF
        else:
            return UNCONFIGURED

    def to_json(self):
        """
        convert tree to json
        """
        groupjson = [t.to_json() for t in self.group]
        return {
            'ident': self.ident,
            'uid': self.uid,
            'card': self.card,
            'group_card': self.group_card,
            'group': groupjson,
            'selection_state': self.selection_state,
        }

def load_json(filename):
    """
    Loads a file as json
    """
    with open(filename) as f:
        page = f.read()
        app.logger.info(page)
    return json.loads(page)


def iclafer_to_conftree(node):
    """
    Convert a iclafer node into a ConfTree.

    :return: a Tree or None if it is not a iClafer
    """

    if 'iClafer' not in node:
        return None

    iclafer = node['iClafer']
    ident = iclafer['ident']
    uid = iclafer['uid']

    t = []
    if 'elements' in iclafer:
        ts = [iclafer_to_conftree(e) for e in iclafer['elements']]
        ts = [t for t in ts if t is not None]

    assert 'card' in iclafer
    t = ConfTree(
        ident=ident,
        uid=uid,
        card=iclafer['card'],
        group_card=iclafer['gcard']['interval'],
        group=ts
    )

    return t

def selected_features_to_constraints(feats):
    """
    Convert a set of selected features to constraints

    :return: str
    """
    res = ""
    for _, sel in feats.items():
        if sel[0] == 'selected':
            res += "\n" + "[ " + sel[1] + " ]"
        elif sel[0] == 'rejected':
            res += "\n" + "[ !" + sel[1] + " ]"
    return res

@app.route('/')
def feature_configurator():
    """
    endpoint for the configurator app
    """
    app.logger.info('feature configurator')
    filepath = os.path.join(CODE_DIR, 'user_ui.html')
    with open(filepath) as f:
        page = f.read()
        app.logger.debug(page)
    return page

@app.route('/uploadold/', methods=['POST'])
def uploadold_file():
    """
    upload a clafer file
    """
    app.logger.debug('load file')

    # TODO: save to a filename that depends on user token
    filename = os.path.join(WORK_DIR, 'generated_file')
    filename_cfr = filename + '.cfr'
    filename_json = filename + '.json'
    with open(filename_cfr, 'wb') as f:
        f.write(request.data)

    cp = subprocess.run([CLAFER, filename_cfr, '-m=json'], capture_output=True)
    app.logger.info('Clafer output: ' + str(cp.stdout))
    d = load_json(filename_json)
    t = ClaferModule(d).to_conftree()
    app.logger.debug('tree to respond: ' + str(t.to_json()))
    return json.dumps(t.to_json())


@app.route('/upload/<string:name>', methods=['POST'])
def upload_file(name):
    """
    upload a clafer file
    """
    app.logger.debug('load file')

    # TODO: save to a filename that depends on user token
    filename = os.path.join(WORK_DIR, 'generated_file')
    filename_cfr = filename + '.cfr'
    filename_json = filename + '.json'
    with open(filename_cfr, 'wb') as f:
        f.write(request.data)

    insert_feature_model_db(name, request.data.decode('utf8'))
    test = retrieve_feature_models_db()
    app.logger.info(str(test))
    app.logger.info('The id is: {}'.format(test[0][0]))
    cp = subprocess.run([CLAFER, filename_cfr, '-m=json'], capture_output=True)
    app.logger.info('Clafer output: ' + str(cp.stdout))
    d = load_json(filename_json)
    imodule = ClaferModule(d)
    tree = imodule.build_conftree()
    app.logger.debug('tree to respond: ' + str(tree.to_json()))
    return json.dumps(tree.to_json())

@app.route('/configure/', methods=['POST'])
def configure_features():
    """
    process feature configurations
    """
    app.logger.debug('configure')

    data = json.loads(request.data)
    filename = data['filename']
    file_content = retrieve_model_from_db(filename)
    constraints = selected_features_to_constraints(data['feature_selection'])

    # pylint: disable=line-too-long
    # cp = subprocess.run(['claferIG', filename_cfr, '--useuids', '--addtypes', '--ss=simple', '--maxint=31', '--json'])
    # app.logger.debug('\n sdfdsf\n')
    # app.logger.debug('ClaferIG output: ' + (str(cp.stdout)))
    # d = load_json(filename_json)

    newcontent = file_content + constraints
    return newcontent


@app.route('/loadexample/', methods=['PUT'])
def load_example():
    """
    load example file
    """
    app.logger.debug('load example file')
    tempfilepath = os.path.join(CODE_DIR, 'secure_cpu_example_flattened.json')
    d = load_json(tempfilepath)
    t = ClaferModule(d).to_conftree()
    app.logger.debug(str(t.to_json()))
    return json.dumps(t.to_json())


app.run('localhost', port=3784, debug=True)
