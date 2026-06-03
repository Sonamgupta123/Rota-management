import React from 'react';
import BaseAuditForm from '../core/BaseAuditForm';
import { carePlanConfig } from '../configs/carePlan.config';

const CarePlanAudit = (props) => {
  return (
    <BaseAuditForm 
      config={carePlanConfig}
      {...props}
    />
  );
};

export default CarePlanAudit;
