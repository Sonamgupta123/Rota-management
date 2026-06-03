import React from 'react';
import logoImg from '../../assets/logo.png';

const Logo = ({ className = "h-24 w-auto" }) => {
  return (
    <div className="flex items-center justify-center">
      <img 
        src={logoImg} 
        alt="AS CARE - Love | Care | Support" 
        className={`${className} object-contain`}
      />
    </div>
  );
};

export default Logo;
