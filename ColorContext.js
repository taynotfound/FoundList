import React, { createContext, useState } from 'react';

export const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [palette, setPalette] = useState([]);

  return (
    <ColorContext.Provider value={{ palette, setPalette }}>
      {children}
    </ColorContext.Provider>
  );
};