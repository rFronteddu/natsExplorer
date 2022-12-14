import './Record.css';
import React from 'react';
import { RecordModel } from '../models/recordModel';

function Record(props: {record: RecordModel, depth: number}) {
    return (
        <div>
            <span style={{paddingLeft: `${props.depth*20}px`}}>{JSON.stringify(props.record)}</span>
        </div>
    );
}

export default Record;