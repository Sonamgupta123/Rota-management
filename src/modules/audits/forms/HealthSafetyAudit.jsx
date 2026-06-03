import React from 'react';
import BaseAuditForm from '../core/BaseAuditForm';
import { healthSafetyConfig } from '../configs/healthSafety.config';

const HealthSafetyAudit = (props) => {
  return (
    <BaseAuditForm 
      config={healthSafetyConfig}
      {...props}
    />
  );
};

export default HealthSafetyAudit;
