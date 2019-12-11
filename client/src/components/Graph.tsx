import React, { useRef, useEffect, RefObject } from 'react';

import '../style/Graph.scss';

import {
    ISystemEntry,
} from '../state/system';

import {
    graphFeatureModel,
    SelectFeatureCallback
} from './graph-helper';

export interface IGraphProps {
    system: ISystemEntry;
    selectFeature: SelectFeatureCallback;
}

export const Graph: React.FC<IGraphProps> = ({
    system,
    selectFeature,
}) => {

    const visContainer = useRef(null) as RefObject<HTMLDivElement>;

    useEffect(() => {
        const ref = visContainer ? visContainer.current : null;
        const treeData = system.conftree;

        if (!ref) return;
        if (!treeData) return;

        const hasDataToRender = treeData && treeData.features && Object.keys(treeData.features).length > 0;

        if (!hasDataToRender) return;

        graphFeatureModel(
            ref,
            selectFeature,
            system);
    }, [
        visContainer,
        selectFeature,
        system
    ]);

    return (
        <div
            className='Graph'
            ref={ visContainer } />
    );
};