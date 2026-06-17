import { useContext } from 'react';
import { CardGameContext, CardGameContextType } from '../Contexts/CardGameContext';

export const useCardGame = (): CardGameContextType => {
  const context = useContext(CardGameContext);

  if (!context) {
    throw new Error('useCardGame must be used within a CardGameProvider');
  }

  return context;
};
