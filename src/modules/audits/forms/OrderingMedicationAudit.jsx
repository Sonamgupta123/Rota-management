import React from 'react';
import BaseAuditForm from '../core/BaseAuditForm';
import { orderingMedicationConfig } from '../configs/orderingMedication.config';

const OrderingMedicationAudit = (props) => {
  return (
    <BaseAuditForm 
      config={orderingMedicationConfig}
      {...props}
    />
  );
};

export default OrderingMedicationAudit;
