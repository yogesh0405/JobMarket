import React from 'react';
import { SecuritySettings } from '../../components/profile/SecuritySettings';

export const SecurityPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <SecuritySettings />
    </div>
  );
};

export default SecurityPage;
