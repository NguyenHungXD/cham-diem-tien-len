import { useContext } from 'react';
import { CardGameContext } from '../Contexts/CardGameContext';

export const useCardGame = () => {
  const context = useContext(CardGameContext);

  if (!context) {
    throw new Error('useCardGame must be used within a CardGameProvider');
  }

  return context;
};
