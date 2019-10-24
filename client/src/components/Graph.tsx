import React, { useRef, useEffect, RefObject } from 'react';

import '../style/Graph.scss';

import { graphSimple, ITreeNode } from './graph-helper';

export interface IGraphProps {
    data?: ITreeNode;
}

export const Graph: React.FC<IGraphProps> = ({ data: treeData }) => {

    const d3Container = useRef(null) as RefObject<SVGSVGElement>;

    useEffect(() => {
        const ref = d3Container ? d3Container.current : null;

        if (!(treeData && ref)) return;

        graphSimple(ref, treeData);
    }, [treeData, d3Container]);

    return (
        <svg
            className='Graph'
            height='500'
            ref={ d3Container } />
    );
};