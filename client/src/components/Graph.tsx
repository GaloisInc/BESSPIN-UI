import React, { useRef, useEffect, RefObject } from 'react';

import '../style/Graph.scss';

import {
    graphFeatureModel,
    IFeatureModel
} from './graph-helper';

export interface IGraphProps {
    data?: IFeatureModel;
}

export const Graph: React.FC<IGraphProps> = ({ data: treeData }) => {

    const visContainer = useRef(null) as RefObject<HTMLDivElement>;

    useEffect(() => {
        const ref = visContainer ? visContainer.current : null;

        if (!(treeData && ref)) return;

        graphFeatureModel(ref, treeData);
    }, [treeData, visContainer]);

    return (
        <div
            className='Graph'
            ref={ visContainer } />
    );
};