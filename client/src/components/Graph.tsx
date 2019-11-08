import React, { useRef, useEffect, RefObject } from 'react';

import '../style/Graph.scss';

import {
    graphFeatureModel,
    IFeatureModel
} from './graph-helper';

import {
    selectFeatureCallback,
} from '../pages/ConfigureCpu';


export interface IGraphProps {
    data?: IFeatureModel;
    selectFeatureCallback: selectFeatureCallback;
}


export const Graph: React.FC<IGraphProps> = ({ data: treeData, selectFeatureCallback }) => {

    const visContainer = useRef(null) as RefObject<HTMLDivElement>;

    useEffect(() => {
        const ref = visContainer ? visContainer.current : null;

        if (!ref) return;
        if (!treeData) return;

        const hasDataToRender = treeData && treeData.features && Object.keys(treeData.features).length > 0;

        if (!hasDataToRender) return;

        graphFeatureModel(ref, treeData, selectFeatureCallback);
    }, [treeData, visContainer, selectFeatureCallback]);

    return (
        <div
            className='Graph'
            ref={ visContainer } />
    );
};