from helpers import (
    BesspinTestApiBaseClass,
    create_ArchExtract,
    create_ArchExtractOutput,
    DEFAULT_HEADERS,
)
import json
from datetime import datetime

from app.models import (
    db,
    ArchExtract,
    ArchExtractOutput,
)

class TestArchExtractApi(BesspinTestApiBaseClass):
    BASE_ENDPOINT = '/api/arch-extract'

    def test_arch_extract_list(self):
        test_arch_extract_label = 'TEST ARCH EXTRACT LABEL'
        test_arch_extract_input = 'TEST ARCH EXTRACT INPUT'
        ae = create_ArchExtract(
            archExtractInput=test_arch_extract_input,
            label=test_arch_extract_label,
        )

        self.assertIsNotNone(ae.archExtractId)

        response = self.client.get(
            f'{self.BASE_ENDPOINT}/list',
            headers=DEFAULT_HEADERS,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json()['archExtractIdList'][0]['label'],
            test_arch_extract_label
        )

    def test_arch_extract_fetch(self):
        test_arch_extract_label = 'TEST ARCH EXTRACT LABEL'
        test_arch_extract_input = 'TEST ARCH EXTRACT INPUT'
        ae = create_ArchExtract(
            archExtractInput=test_arch_extract_input,
            label=test_arch_extract_label,
        )

        e = ArchExtract.query.all()[0]

        response = self.client.get(
            f'{self.BASE_ENDPOINT}/fetch/{e.archExtractId}',
            headers=DEFAULT_HEADERS,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {
                'archExtractId': e.archExtractId,
                'archExtractInput': test_arch_extract_input,
                'archExtractOutputList': [],
            }
        )

    def test_arch_extract_fetch2(self):
        test_arch_extract_label = 'TEST ARCH EXTRACT LABEL'
        test_arch_extract_input = 'TEST ARCH EXTRACT INPUT'
        test_arch_extract_filename = 'TEST ARCH EXTRACT FILENAME'
        ae = create_ArchExtract(
            archExtractInput=test_arch_extract_input,
            label=test_arch_extract_label,
        )

        aeo = create_ArchExtractOutput(
            archExtractId=ae.archExtractId,
            archExtractOutputFilename=test_arch_extract_filename,
        )

        archExtractRecord = ArchExtract.query.all()[0]
        archExtractOutputRecord = ArchExtractOutput.query.filter_by(archExtractOutputId=aeo.archExtractOutputId)

        response = self.client.get(
            f'{self.BASE_ENDPOINT}/fetch/{ae.archExtractId}',
            headers=DEFAULT_HEADERS,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {
                'archExtractId': ae.archExtractId,
                'archExtractInput': test_arch_extract_input,
                'archExtractOutputList': [
                    {
                        'archExtractOutputId': aeo.archExtractOutputId,
                        'archExtractOutputFilename': test_arch_extract_filename,
                    },
                ],
            }
        )

    def test_arch_extract_new(self):
        test_arch_extract_label = 'TEST ARCH EXTRACT LABEL'
        test_arch_extract_input = 'TEST ARCH EXTRACT INPUT'

        cpu_type = 'piccolo'

        response = self.client.post(
            f'{self.BASE_ENDPOINT}/new/{cpu_type}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(
                dict(
                    label=test_arch_extract_label
                )
            )
        )

        self.assertEqual(response.status_code, 200)

        archExtractRecord = ArchExtract.query.all()[0]
        d = response.get_json()
        del d['archExtractInput']
        del d['archExtractOutputList']
        self.assertEqual(
            d,
            {
                'label': test_arch_extract_label,
                'archExtractId': archExtractRecord.archExtractId,
            }
        )
    def test_arch_extract_submit(self):
        test_arch_extract_label = 'TEST ARCH EXTRACT LABEL'
        test_arch_extract_input = 'TEST ARCH EXTRACT INPUT'
        test_arch_extract_input_new = 'NEW INPUT'

        ae = create_ArchExtract(
            archExtractInput=test_arch_extract_input,
            label=test_arch_extract_label,
        )


        response = self.client.post(
            f'{self.BASE_ENDPOINT}/submit/{str(ae.archExtractId)}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(
                dict(
                    archExtractInput=test_arch_extract_input_new
                )
            )
        )

        self.assertEqual(response.status_code, 200)

        archExtractRecord = ArchExtract.query.all()[0]
        self.assertEqual(
            archExtractRecord.archExtractInput,
            test_arch_extract_input_new
        )

    def test_arch_extract_run_and_convert(self):
        test_arch_extract_label = 'TEST ARCH EXTRACT LABEL'
        test_arch_extract_input = 'TEST ARCH EXTRACT INPUT'

        cpu_type = 'piccolo-high-level'

        response = self.client.post(
            f'{self.BASE_ENDPOINT}/new/{cpu_type}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(
                dict(
                    label=test_arch_extract_label
                )
            )
        )

        self.assertEqual(response.status_code, 200)

        ae = ArchExtract.query.all()[0]
        d = response.get_json()
        del d['archExtractInput']
        del d['archExtractOutputList']
        self.assertEqual(
            d,
            {
                'label': test_arch_extract_label,
                'archExtractId': ae.archExtractId,
            }
        )

        response_run = self.client.post(
            f'{self.BASE_ENDPOINT}/run/{ae.archExtractId}',
            headers=DEFAULT_HEADERS,
        )

        self.assertEqual(response_run.status_code, 200)

        self.assertEqual(
            len(response_run.get_json()['archExtractOutputList']),
            44
        )

        an_output_id = response_run.get_json()['archExtractOutputList'][0]['archExtractOutputId']

        response_convert = self.client.get(
            f'{self.BASE_ENDPOINT}/convert/{an_output_id}',
            headers=DEFAULT_HEADERS,
        )
        self.assertEqual(response_convert.status_code, 200)

        output_content_converted = response_convert.get_json()['archExtractOutputContentConverted']
        self.assertEqual(
            len(output_content_converted) > 200,
            True
        )

