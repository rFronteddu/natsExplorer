import './Record.css';
import React, { useState, useEffect } from 'react';
import { RecordModel } from '../models/recordModel';

function Record(props: {record: RecordModel, depth: number}) {
    return (
        <div className="record">
            <span style={{paddingLeft: `${props.depth*20}px`}}>${JSON.stringify(props.record)}</span>
        </div>
    );
}

export default Record;