import os
import unittest
import logging

from app import create_app
from app.models import (
    db,
    CweScore,
    FeatureModel,
    ReportJob,
    SystemConfigurationInput,
    VersionedResource,
    VulnerabilityConfigurationInput,
    Workflow,
    ArchExtract,
    ArchExtractOutput,
)

DEFAULT_HEADERS = {'Content-type': 'application/json'}
FM_JSON_TEST_FILEPATH = os.path.join(os.path.dirname(__file__), '../../app/ui/examples/flute.fm.json')


def load_test_fmjson() -> str:
    data = ''
    with open(FM_JSON_TEST_FILEPATH, 'r') as myfile:
        data = ''.join(myfile.readlines())
    return data


def add_to_db(*objs):
    [db.session.add(o) for o in objs]
    db.session.commit()


def create_featureModel(**kwargs) -> FeatureModel:
    fm = FeatureModel(**kwargs)
    add_to_db(fm)
    return fm


def create_reportJob(**kwargs) -> ReportJob:
    rj = ReportJob(
        label=kwargs['label'],
        workflowId=kwargs['workflowId'],
        statusId=kwargs['statusId']
    )
    add_to_db(rj)
    return rj


def create_sysConfig(**kwargs) -> SystemConfigurationInput:
    sc = SystemConfigurationInput(
        label=kwargs['label'],
        nixConfigFilename=kwargs['nixConfigFilename'],
        nixConfig=kwargs['nixConfig'],
        workflowId=kwargs['workflowId']
    )
    add_to_db(sc)
    return sc


def create_versionedResource(**kwargs) -> VersionedResource:
    vr = VersionedResource(
        label=kwargs['label'],
        url=kwargs['url'],
        version=kwargs['version'],
        resourceTypeId=kwargs['resourceTypeId']
    )
    add_to_db(vr)
    return vr


def create_workflow(**kwargs) -> Workflow:
    wf = Workflow(label=kwargs['label'])
    add_to_db(wf)
    return wf


def create_vulnerabilityConfig(**kwargs) -> VulnerabilityConfigurationInput:
    vc = VulnerabilityConfigurationInput(
        label=kwargs['label'],
        featureModelUid=kwargs['featureModelUid'],
        workflowId=kwargs['workflowId'],
        vulnClass=kwargs['vulnClass']
    )
    add_to_db(vc)
    return vc

def create_ArchExtract(**kwargs) -> ArchExtract:
    vc = ArchExtract(**kwargs)
    add_to_db(vc)
    return vc

def create_ArchExtractOutput(**kwargs) -> ArchExtractOutput:
    vc = ArchExtractOutput(**kwargs)
    add_to_db(vc)
    return vc


def create_cwe_score(**kwargs) -> CweScore:
    cs = CweScore(
        reportJobId=kwargs['reportJobId'],
        cwe=kwargs['cwe'],
        score=kwargs['score'],
        notes=kwargs['notes']
    )
    add_to_db(cs)
    return cs


class BesspinTestBaseClass(unittest.TestCase):

    def setUp(self):
        self.app = create_app('test')
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.app.logger.setLevel(logging.CRITICAL)
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        self.app.logger.setLevel(logging.NOTSET)


class BesspinTestApiBaseClass(BesspinTestBaseClass):

    def setUp(self):
        super(BesspinTestApiBaseClass, self).setUp()
        self.client = self.app.test_client()
