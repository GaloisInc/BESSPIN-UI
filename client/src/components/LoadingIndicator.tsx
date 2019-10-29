import React from 'react';

import {
    Modal,
    Spinner
} from 'react-bootstrap';

import '../style/LoadingIndicator.scss';

export const LoadingIndicator: React.FC = () => {
    return (
        <Modal className='LoadingIndicator' show={ true } size='sm' aria-labelledby='contained-modal-title-vcenter' centered>
            <Modal.Header>Loading...</Modal.Header>
            <Modal.Body>
                <Spinner animation='border' role='status'>
                    <span className='sr-only'>Loading...</span>
                </Spinner>
            </Modal.Body>
            <Modal.Footer></Modal.Footer>
        </Modal>
    );
};
