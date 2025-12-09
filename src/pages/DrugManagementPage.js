//pages/DrugManagement.js
import React from 'react';
import { Card, Tabs, Tab } from 'react-bootstrap';
import FormulaTab from '../components/tabs/FormulaTab';
import DilutionTab from '../components/tabs/DilutionTab';
import '../styles/DrugManagement.css';

function DrugManagementPage() {
    return (
        <Card className="shadow-sm border-light-subtle">
            <Card.Header className="bg-white py-3">
                <h2 className="mb-0">Drug Management</h2>
            </Card.Header>
            <Card.Body>
                <Tabs defaultActiveKey="formulas" id="drug-management-tabs" className="drug-management-tabs" justify>

                    <Tab eventKey="formulas" title="Formulas">
                        <FormulaTab />
                    </Tab>
                    <Tab eventKey="dilutions" title="Dilutions">
                        <DilutionTab />
                    </Tab>
                </Tabs>
            </Card.Body>
        </Card>
    );
}

export default DrugManagementPage;