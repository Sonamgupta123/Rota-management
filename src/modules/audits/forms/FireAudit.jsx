import React from 'react';
import BaseAuditForm from '../core/BaseAuditForm';
import { fireConfig } from '../configs/fire.config';

const FireAudit = (props) => {
  return (
    <BaseAuditForm 
      config={fireConfig}
      {...props}
    />
  );
};

export default FireAudit;
