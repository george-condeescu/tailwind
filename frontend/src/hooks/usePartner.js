import { useContext } from 'react';
import { PartnerContext } from '../context/partnerContext';

export const usePartner = () => {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error('usePartner must be used within PartnerProvider');
  }
  return context;
};
