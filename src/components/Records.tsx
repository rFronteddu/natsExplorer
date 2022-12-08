import './Records.css';
import React, { useState, useEffect, useRef } from 'react';
import uuid from 'react-uuid';
import { RecordModel } from '../models/recordModel';
import Record from './Record';
import useInterval from '../hooks/useInterval';

function Records(props: { search: string}) {
    const [records, setRecords] = useState<RecordModel[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<RecordModel | null>(null);
    const [search, setSearch] = useState<string>(props.search);

    useInterval(async () => {
        console.log('interval - '+ search);
        if (search === '') 
            return;
        await fetch(`http://localhost:8081/nats?search=${encodeURIComponent(search)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
                .then(response => {
                    if (response.status === 200) {
                        response.json().then(data => {
                            if (data !== null && data !== undefined) {
                                console.log(data);  
                                setRecords(data);
                            }
                            if (data.length > 0) {
                                setSelectedRecord(data[0]);
                            } else {
                                setSelectedRecord(null);
                            }
                        });
                    }
                })
    }, 1000);

    useEffect(() => {
        setSearch(props.search);
    }, [props.search]);

    return (
        <div id='records'>
            <h1>Records</h1>
            {records.map(r => (
                <div className="row" key={uuid()}>
                    <div className="col-xl-12">
                        <Record record={r} depth={1}/>
                    </div>
                </div>
            ))
            }
        </div>
    );
}

export default Records;