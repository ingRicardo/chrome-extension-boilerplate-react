// src/components/NetworkTable.tsx
import React from 'react';


import './NetworkTable.css'; // Assuming you create a CSS file for styles

interface Request {
    id: string;
    url: string;
    status: number;
    response: string;
}

interface NetworkTableProps {
    requests: Request[];
}

const NetworkTable: React.FC<NetworkTableProps> = ({ requests }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th className="header">URL</th>
                    <th className="header">Status</th>
                    <th className="header">Response</th>
                </tr>
            </thead>
            <tbody>
                {/* Table body content will go here */}
            </tbody>
        </table>
    );
};

export default NetworkTable;