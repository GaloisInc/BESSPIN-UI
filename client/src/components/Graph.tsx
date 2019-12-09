import React, { useRef, useEffect, RefObject } from 'react';

import '../style/Graph.scss';

import {
    ISelectionMap,
    ISystemEntry,
} from '../state/system';

import {
    graphFeatureModel,
    IFeatureModel,
    SelectFeatureCallback
} from './graph-helper';

export interface IGraphProps {
    system: ISystemEntry;
    data?: IFeatureModel;
    selectFeature: SelectFeatureCallback;
}

export const Graph: React.FC<IGraphProps> = ({
    system,
    data: treeData,
    selectFeature,
}) => {

    const visContainer = useRef(null) as RefObject<HTMLDivElement>;

    useEffect(() => {
        const ref = visContainer ? visContainer.current : null;

        if (!ref) return;
        if (!treeData) return;

        const hasDataToRender = treeData && treeData.features && Object.keys(treeData.features).length > 0;

        if (!hasDataToRender) return;

        graphFeatureModel(ref, treeData, selectFeature, system);
    }, [treeData, visContainer, selectFeature, system]);

    return (
        <div
            className='Graph'
            ref={ visContainer } />
    );
};