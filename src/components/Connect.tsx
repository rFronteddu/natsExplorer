import './Connect.css';
import React, { useState } from 'react';
import { FaTrash } from "react-icons/fa";
import uuid from 'react-uuid';
import { toast } from 'react-toastify';
import useLocalStorage from '../hooks/useLocalStorage';
import { Connection } from '../models/connection';

function Connect(props: { connectionResultCallback: (result: boolean) => void }) {
    const [name, setName] = useState<string>('Connection');
    const [ip, setIp] = useState<string>('127.0.0.1');
    const [port, setPort] = useState<number>(1883);
    const [connections, setConnections] = useLocalStorage<Connection[]>('connections', []);
    const [connecting, setConnecting] = useState<boolean>(false);

    async function connect() {
        setConnecting(true);
        var result = false;
        await fetch(`http://localhost:8081/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip: ip, port: port })
        })
        .then(response => {
            if (response.status === 200) {
                result = true;
                toast.success('The connection has been established!', {
                    position: toast.POSITION.TOP_CENTER
                });
            } else {
                response.text().then(text => {
                    toast.error(`The connection failed! \n ${text}`, {
                        position: toast.POSITION.TOP_CENTER
                    });
                  });
            }
        })
        setConnecting(false);
        props.connectionResultCallback(result);
    }

    function saveConnection() {
        setConnections(
            [
                ...connections,
                new Connection(name, ip, port)
            ]
        );
        toast.success('The connection has been saved!', {
            position: toast.POSITION.TOP_RIGHT
        });
    }

    function loadSavedConnection(connection: Connection) {
        setName(connection.name);
        setIp(connection.ip);
        setPort(connection.port);
    }

    function deleteSavedConnection(connection: Connection) {
        setConnections(connections.filter(c => c !== connection));
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-xl-4">
                    <div id="connections">
                        {connections.map(c => (
                            <div className="row" key={uuid()}>
                                <div className="col-xl-9">
                                    <div className='connection' onClick={() => loadSavedConnection(c)}>
                                        <p>{c.name}</p>
                                        <em>{c.ip}:{c.port}</em>
                                    </div>
                                </div>
                                <div className="col-xl-3">
                                    <FaTrash style={{ cursor: "pointer" }} onClick={() => deleteSavedConnection(c)} />
                                </div>
                            </div>
                        ))
                        }
                    </div>
                </div>
                <div id="connectionForm" className="col-xl-8">
                    <div className="form-group">
                        <label htmlFor="name">Connection name</label>
                        <input id="name" className="form-control" type="text" placeholder={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="ip">IP Address</label>
                        <input id='ip' className="form-control" type="text" placeholder={ip} onChange={e => setIp(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="port">Port</label>
                        <input id='port' className="form-control" type="number" value={port} onChange={e => setPort(Number(e.target.value))} />
                    </div>
                    <br />
                    <button className='btn btn-primary' onClick={connect} disabled={connecting}>Connect</button>
                    <button className="btn btn-secondary" onClick={saveConnection}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default Connect;
