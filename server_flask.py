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


class CfgTree:
    """
    A tree data-structure for a Configuration Feature Model.
    """

    def __init__(self, ident, select_opt, branches):
        self.ident = ident
        self.select_opt = select_opt
        self.branches = branches

    def to_json(self):
        """
        convert tree to json
        """
        tjson = [t.to_json() for t in self.branches]
        return {
            'ident': self.ident,
            'select_opt': self.select_opt,
            'subnodes': tjson,
        }

def load_json(filename):
    """
    Loads a file as json
    """
    with open(filename) as f:
        page = f.read()
        app.logger.info(page)
    return json.loads(page)


def iclafer_to_tree(d):
    """
    Convert a json clafer model for iclafer node into a CfgTree.

    :return: a Tree or None if it is not a iClafer
    """

    if 'iClafer' not in d:
        return None

    d = d['iClafer']
    ident = d['ident']

    t = []
    if 'elements' in d:
        ts = [iclafer_to_tree(e) for e in d['elements']]
        ts = [t for t in ts if t is not None]

    assert 'card' in d
    t = CfgTree(ident, d['card'], ts)

    return t


def cfr_to_tree(d):
    """
    Convert a json clafer model into a CfgTree.

    :return: Tree
    """
    # get to the list of declarations:
    d = d['iModule']
    d = d['mDecls']

    # start the traversal
    return CfgTree('RootNode', 'Select', [iclafer_to_tree(t) for t in d])


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
    t = cfr_to_tree(d)
    app.logger.debug('tree to respond: ' + str(t.to_json()))
    return json.dumps(t.to_json())


@app.route('/loadexample/', methods=['PUT'])
def load_example():
    """
    load example file
    """
    app.logger.debug('load example file')
    tempfilepath = 'secure_cpu_example_flattened.json'
    d = load_json(tempfilepath)
    t = cfr_to_tree(d)
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
