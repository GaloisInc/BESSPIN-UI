"""
A feature model configurator web app
"""

import logging
import json
import subprocess
from flask import Flask
from flask import request
from flask.logging import default_handler

# pylint: disable=invalid-name
# pylint: disable=no-member


app = Flask(__name__)

default_handler.setLevel(logging.DEBUG)


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
        # get to the list of declarations:
        content = self.module['iModule']
        decls = content['mDecls']

        # start the traversal
        group = [iclafer_to_conftree(elm) for elm in decls]
        return ConfTree(ident='Module', group=group)

    def unfold_product(self, prod):
        """
        Unfold a product in a model
        """

        iclafer = prod['iClafer']

        if 'super' in iclafer and not iclafer['elements']:
            app.logger.debug('USPER')
            # notice it could also be ['super']['exp']['binding']
            assert iclafer['super']['exp']['isTop'] is True
            abstract = self.find_uid(iclafer['super']['exp']['sident'])
            app.logger.debug('SDFSDF ' + json.dumps(abstract))
            iclafer['elements'] = abstract['iClafer']['elements'] if abstract is not None else []

        #app.logger.debug('BUILT '+ json.dumps(prod))
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
            assert isinstance(decl['iClafer']['isAbstract'], bool)
            if not decl['iClafer']['isAbstract']:
                res += [decl]
        return res


    def build_conftree(self):
        """
        Build a Config Tree from a model

        :return: Tree
        """
        prods = self.find_products()
        if prods == []:
            return None

        # TODO: generalize to more than one. Currently just one:
        prod = prods[0]
        prod = self.unfold_product(prod)
        return iclafer_to_conftree(prod)



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
        self.card = card # [0..1], [1..1], [0..*], etc.
        self.group_card = group_card # or [1..*], xor, [1..1]
        self.group = group # a list of ConfTree

    def to_json(self):
        """
        convert tree to json
        """
        groupjson = [t.to_json() for t in self.group]
        return {
            'ident': self.ident,
            'card': self.card,
            'group_card': self.group_card,
            'group': groupjson,
        }

def load_json(filename):
    """
    Loads a file as json
    """
    with open(filename) as f:
        page = f.read()
        app.logger.info(page)
    return json.loads(page)


def iclafer_to_conftree(d):
    """
    Convert a json clafer model for iclafer node into a ConfTree.

    :return: a Tree or None if it is not a iClafer
    """

    if 'iClafer' not in d:
        return None

    d = d['iClafer']
    ident = d['ident']

    t = []
    if 'elements' in d:
        ts = [iclafer_to_conftree(e) for e in d['elements']]
        ts = [t for t in ts if t is not None]

    assert 'card' in d
    t = ConfTree(ident=ident, card=d['card'], group=ts)

    return t



@app.route('/')
def feature_configurator():
    """
    endpoint for the configurator app
    """
    app.logger.info('feature configurator')
    filepath = './user_ui.html'
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
    filename = './generated_file'
    filename_cfr = filename + '.cfr'
    filename_json = filename + '.json'
    with open(filename_cfr, 'wb') as f:
        f.write(request.data)

    cp = subprocess.run(['clafer', filename_cfr, '-m=json'], capture_output=True)
    app.logger.info('Clafer output: ' + str(cp.stdout))
    d = load_json(filename_json)
    t = ClaferModule(d).to_conftree()
    app.logger.debug('tree to respond: ' + str(t.to_json()))
    return json.dumps(t.to_json())


@app.route('/upload/', methods=['POST'])
def upload_file():
    """
    upload a clafer file
    """
    app.logger.debug('load file')

    # TODO: save to a filename that depends on user token
    filename = './generated_file'
    filename_cfr = filename + '.cfr'
    filename_json = filename + '.json'
    with open(filename_cfr, 'wb') as f:
        f.write(request.data)

    cp = subprocess.run(['clafer', filename_cfr, '-m=json'], capture_output=True)
    app.logger.info('Clafer output: ' + str(cp.stdout))
    d = load_json(filename_json)
    imodule = ClaferModule(d)
    tree = imodule.build_conftree()
    app.logger.debug('tree to respond: ' + str(tree.to_json()))
    return json.dumps(tree.to_json())


@app.route('/loadexample/', methods=['PUT'])
def load_example():
    """
    load example file
    """
    app.logger.debug('load example file')
    tempfilepath = 'secure_cpu_example_flattened.json'
    d = load_json(tempfilepath)
    t = ClaferModule(d).to_conftree()
    app.logger.debug(str(t.to_json()))
    return json.dumps(t.to_json())


@app.route('/refine', methods=['PUT'])
def refine_configuration():
    """
    Refine a configuration
    """
    app.logger.info('refine configuration')
    app.logger.info('body:' + str(request.data))
    message = request.data
    return message


app.run('localhost', port=3784, debug=True)
