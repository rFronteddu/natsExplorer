import './TopBar.css';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { connected } from 'process';

function TopBar(props: { connected: boolean, searchTextChangedCallback: (result: string) => void, disconnectResultCallback: (result: boolean) => void }) {
    const [isConnected, setIsConnected] = useState<boolean>(connected);

    useEffect(() => {
        setIsConnected(props.connected);
    });

    async function disconnect() {
        var result = false;
        await fetch(`http://localhost:8081/disconnect`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => {
                if (response.status === 200) {
                    result = true;
                    toast.success('The connection has been terminated!', {
                        position: toast.POSITION.TOP_CENTER
                    });
                } else {
                    response.text().then(text => {
                        toast.error(`Disconnect failed! \n ${text}`, {
                            position: toast.POSITION.TOP_CENTER
                        });
                    });
                }
            })
        if (result) {
            setIsConnected(false);
        }
        props.disconnectResultCallback(!result);
    }

    return (
        <div id="topBar">
            <div className='row'>
                <div className='col-lg-4'>
                    <input className='form-control' onChange={(e) => props.searchTextChangedCallback(e.target.value)} />
                </div>
                <div className='col-lg-4'>

                </div>
                <div className='col-lg-4'>
                    <button className='btn btn-secondary' style={{ float: 'right' }} id="disconnect-button" onClick={disconnect} disabled={!isConnected}>Disconnect</button>
                </div>
            </div>
        </div>
    );
}

export default TopBar;
