import React from 'react';
import BaseAuditForm from '../core/BaseAuditForm';
import { infectionControlConfig } from '../configs/infectionControl.config';

const InfectionControlAudit = (props) => {
  return (
    <BaseAuditForm 
      config={infectionControlConfig}
      {...props}
    />
  );
};

export default InfectionControlAudit;
