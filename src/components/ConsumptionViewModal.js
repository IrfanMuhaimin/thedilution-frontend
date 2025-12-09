import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { format } from 'date-fns';
import * as consumptionService from '../services/consumptionService';

function ConsumptionViewModal({ show, handleClose, inventoryItem }) {
    const [consumptions, setConsumptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show && inventoryItem) {
            const fetchConsumptions = async () => {
                try {
                    setLoading(true);
                    setError('');
                    const allConsumptions = await consumptionService.getAllConsumptions();
                    const itemConsumptions = allConsumptions.filter(
                        c => c.inventoryId === inventoryItem.inventoryId
                    );
                    setConsumptions(itemConsumptions);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchConsumptions();
        }
    }, [show, inventoryItem]);

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Consumption History for: {inventoryItem?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {loading ? (
                    <div className="text-center"><Spinner animation="border" /></div>
                ) : (
                    <Table striped hover responsive>
                        <thead>
                            <tr className="fw-bold">
                                <th>Date</th>
                                <th>Quantity Used</th>
                                <th>Jobcard ID</th>
                                <th>Formula</th>
                            </tr>
                        </thead>
                        <tbody>
                            {consumptions.length > 0 ? (
                                consumptions.map(con => (
                                    <tr key={con.consumptionId}>
                                        <td>{format(new Date(con.consumptionDate), 'dd/MM/yyyy HH:mm')}</td>
                                        <td>{`${con.quantityUsed} ${inventoryItem.unit}`}</td>
                                        <td>{con.jobcardId}</td>
                                        <td>{con.Formula?.name || 'N/A'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">No consumption history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConsumptionViewModal;