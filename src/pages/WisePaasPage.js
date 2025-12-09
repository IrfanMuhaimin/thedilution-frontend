import React from 'react';
import { Card } from 'react-bootstrap';
import '../styles/WisePaasPage.css'; // 1. Import the new CSS file

function HardwareConfigPage() {
  const dashboardUrl = "https://dashboard-amyinnoworks-ews.education.wise-paas.com/d/Eq_Varzvz/dashboard-thedilution?orgId=20&refresh=1s&kiosk";

  return (
    <Card>
      <Card.Header>
        <h2>Wise-PaaS Monitoring Dashboard</h2>
      </Card.Header>
      <Card.Body className="p-0"> 
        <div className="iframe-container">
          <iframe
            src={dashboardUrl}
            title="Wise-PaaS Monitoring Dashboard"
            className="responsive-iframe"
          />
        </div>
      </Card.Body>
    </Card>
  );
}

export default HardwareConfigPage;