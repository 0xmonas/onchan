import React, { createContext, useState, useContext } from 'react';

const EditModeContext = createContext();

export const useEditMode = () => useContext(EditModeContext);

export const EditModeProvider = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <EditModeContext.Provider value={{ isEditing, setIsEditing }}>
      {children}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40" />
      )}
    </EditModeContext.Provider>
  );
};