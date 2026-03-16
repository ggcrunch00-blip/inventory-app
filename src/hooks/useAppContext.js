import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

export default function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('AppContext 내부에서만 사용할 수 있습니다.');
  }

  return context;
}

