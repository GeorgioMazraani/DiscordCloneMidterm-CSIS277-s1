import React from 'react';
import { BsCircleFill, BsMoonFill } from 'react-icons/bs';
import { RiStopCircleFill } from 'react-icons/ri';
import './StatusMenu.css';

const StatusMenu = ({ onSelectStatus, onClose }) => {
    return (
        <div className="status-menu">
            <ul>
                <li onClick={() => onSelectStatus('Online')}>
                    <BsCircleFill className="status-icon online" /> Online
                </li>
                <li onClick={() => onSelectStatus('Idle')}>
                    <BsMoonFill className="status-icon idle" /> Idle
                </li>
                <li onClick={() => onSelectStatus('Do Not Disturb')}>
                    <RiStopCircleFill className="status-icon dnd" /> Do Not Disturb
                </li>
                <li onClick={() => onSelectStatus('Invisible')}>
                    <BsCircleFill className="status-icon invisible" /> Invisible
                </li>
            </ul>
        </div>
    );
};

export default StatusMenu;
