"""
A feature model configurator web app
"""
import os
import logging
import json
import subprocess
import tempfile
from uuid import uuid4
from flask import Flask
from flask import (
    request,
    send_from_directory,
    render_template,
)
from flask.logging import default_handler
from database import (
    list_models_from_db,
    insert_feature_model_db,
    update_config_db,
    retrieve_feature_models_db,
    retrieve_model_from_db_by_uid
)
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

TOP_LEVEL_FEATURE_IDENT = 'Features'


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
                ident=TOP_LEVEL_FEATURE_IDENT,
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
    for sel in feats:
        # delete leading artificial feature path artificially injected
        # when there are several features at top level
        prefix = TOP_LEVEL_FEATURE_IDENT + '.'
        path = sel['content']['other']
        sel_str = path[len(prefix):] if path.startswith(prefix) else path

        mode = sel['content']['mode']
        if mode == 'selected':
            res += "[ " + sel_str + " ]" + "\n"
        elif mode == 'rejected':
            res += "[ !" + sel_str + " ]" + "\n"
    return res

def configuration_algo(conftree, feature_selection):
    """
    A mock configuration algorithon. Says yes to everything
    """
    for e in feature_selection:
        e['content']['validated'] = True

    return feature_selection


@app.route('/script/dashboard')
def script_dashboard():
    """
    Endpoint serving the dashboard script
    """
    return send_from_directory(
        os.path.join(CODE_DIR, 'js'),
        'dashboard.js',
        mimetype='application/javascript'
    )

@app.route('/script/configurator')
def script_configurator():
    """
    Endpoint serving the configurator script
    """
    return send_from_directory(
        os.path.join(CODE_DIR, 'js'),
        'configurator.js',
        mimetype='application/javascript'
    )


@app.route('/')
def root_page():
    """
    Endpoint for root app.
    Currently set to the dashboard.
    """
    app.logger.info('feature configurator')
    filepath = os.path.join(CODE_DIR, 'dashboard.html')
    with open(filepath) as f:
        page = f.read()
        app.logger.debug(page)
    return page


@app.route('/dashboard/')
def dashboard():
    """
    endpoint for the dashboard
    """
    app.logger.info('feature configurator')
    filepath = os.path.join(CODE_DIR, 'dashboard.html')
    with open(filepath) as f:
        page = f.read()
        app.logger.debug(page)
    return page


@app.route('/dashboard/get_db_models/', methods=['GET'])
def get_db_models():
    """
    list db models
    """
    app.logger.debug('list_db_models')
    models = list_models_from_db()
    return json.dumps(models)


@app.route('/configurator/')
@app.route('/configurator/<string:uid>')
def feature_configurator(uid=None):
    """
    endpoint for the configurator app
    """
    return render_template('configurator.html', uid=uid)


@app.route('/configurator/upload/<string:name>', methods=['POST'])
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

    cp = subprocess.run([CLAFER, filename_cfr, '-m=json'], capture_output=True)
    app.logger.info('Clafer output: ' + str(cp.stdout))
    d = load_json(filename_json)
    imodule = ClaferModule(d)
    tree = imodule.build_conftree().to_json()
    uid = insert_feature_model_db(name, request.data.decode('utf8'), tree)
    test = retrieve_feature_models_db()
    app.logger.info(str(test))
    app.logger.info('The id is: {}'.format(test[0][0]))
    app.logger.debug('tree to respond: ' + str(tree))
    return json.dumps({'uid': uid, 'tree': tree})


@app.route('/configurator/configure/', methods=['POST'])
def configure_features():
    """
    process feature configurations
    """
    app.logger.debug('configure')

    data = json.loads(request.data)
    filename = data['filename']
    uid = data['uid']
    feature_selection = data['feature_selection']
    entry = retrieve_model_from_db_by_uid(uid)
    file_content = retrieve_model_from_db_by_uid(uid)['source']
    validated_features = configuration_algo(
        entry['conftree'],
        feature_selection,
    )
    update_config_db(uid, validated_features)
    constraints = selected_features_to_constraints(feature_selection)

    # pylint: disable=line-too-long
    # cp = subprocess.run(['claferIG', filename_cfr, '--useuids', '--addtypes', '--ss=simple', '--maxint=31', '--json'])
    # app.logger.debug('\n sdfdsf\n')
    # app.logger.debug('ClaferIG output: ' + (str(cp.stdout)))
    # d = load_json(filename_json)

    response = {
        'server_source': file_content,
        'server_constraints': constraints,
        'validated_features': validated_features,
    }
    return json.dumps(response)


@app.route('/configurator/list_db_models/', methods=['GET'])
def list_db_models():
    """
    list db models
    """
    app.logger.debug('list_db_models')
    models = list_models_from_db()
    return json.dumps(models)


@app.route('/configurator/load_from_db/', methods=['POST'])
def load_model_from_db():
    """
    Load model from db
    """
    app.logger.debug('load from db')

    data = json.loads(request.data)
    uid = data['model_uid']
    model = retrieve_model_from_db_by_uid(uid)
    configs = model['configs']
    conftree = model['conftree']
    return json.dumps({
        'uid': model['uid'],
        'source': model['source'],
        'filename': model['filename'],
        'date': model['date'],
        'conftree': conftree,
        'configs': configs,
        'configs_pp': selected_features_to_constraints(configs),
    })


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

@app.route('/monitor/')
@app.route('/monitor/<string:uid>')
def monitor(uid=None):
    """
    endpoint for the configurator app
    """
    return render_template('monitor.html', uid=uid)

@app.route('/metrics/')
@app.route('/metrics/<string:uid>')
def metrics(uid=None):
    """
    endpoint for the configurator app
    """
    return render_template('metrics.html', uid=uid)

app.run('localhost', port=3784, debug=True)
