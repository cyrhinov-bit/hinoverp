import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ADMINBSB_SKINS, DEFAULT_SKIN, getSkinById } from '../themes/skins';

const ThemeCustomizationContext = createContext({
  currentSkin: DEFAULT_SKIN,
  setSkin: () => {},
  allSkins: ADMINBSB_SKINS
});

export function ThemeCustomizationProvider({ children }) {
  const [currentSkin, setCurrentSkin] = useState(() => {
    const saved = localStorage.getItem('hinov_adminbsb_skin');
    return saved ? getSkinById(saved) : DEFAULT_SKIN;
  });

  useEffect(() => {
    if (currentSkin) {
      localStorage.setItem('hinov_adminbsb_skin', currentSkin.id);
    }
  }, [currentSkin]);

  const setSkin = (skinId) => {
    setCurrentSkin(getSkinById(skinId));
  };

  const value = useMemo(
    () => ({
      currentSkin,
      setSkin,
      allSkins: ADMINBSB_SKINS
    }),
    [currentSkin]
  );

  return (
    <ThemeCustomizationContext.Provider value={value}>
      {children}
    </ThemeCustomizationContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(ThemeCustomizationContext);
  return context || { currentSkin: DEFAULT_SKIN, setSkin: () => {}, allSkins: ADMINBSB_SKINS };
}

