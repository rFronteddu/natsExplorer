import './App.css';
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import Connect from './components/Connect';
import TopBar from './components/TopBar';
import Records from './components/Records';
import Details from './components/Details';

const customStyles = {
    content: {
        width: '50%',
        height: '45vh',
        margin: 'auto',
        border: '3px solid gray',
        padding: '20px'
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.5)'
    }
};

Modal.setAppElement('#root');

function App() {
    const [connected, setIsConnected] = useState(false);
    const [modalIsOpen, setIsOpen] = useState(!connected);
    const [searchSubject, setSearchSubject] = useState('');

    useEffect(() => {
        setIsOpen(!connected);
    }, [connected]);

    return (
        <div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setIsOpen(false)}
                style={customStyles}
                shouldCloseOnOverlayClick={false}
                shouldCloseOnEsc={false}
            >
                <Connect connectionResultCallback={(result) => setIsConnected(result)} />
            </Modal>
            <TopBar searchTextChangedCallback={setSearchSubject} connected={connected} disconnectResultCallback={(result) => setIsConnected(result)} />
            {
                connected &&
                <div className='row' id='content'>
                    <div className='col-8-lg'>
                        <Records search={searchSubject} />
                    </div>
                    <div className='col-4-lg'>
                        <Details />
                    </div>
                </div>
            }

        </div>
    );
}

export default App;
