import { createContext, useContext, type ReactNode } from 'react';
import { useGameState } from '../hooks/useGameState';

type Game = ReturnType<typeof useGameState>;

const GameContext = createContext<Game | null>(null);

/** One game shared by every route, so the guide and records pages can be visited mid-game. */
export function GameProvider({ children }: { children: ReactNode }) {
  const game = useGameState();
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook lives beside its provider
export function useGame(): Game {
  const game = useContext(GameContext);
  if (!game) throw new Error('useGame must be used inside <GameProvider>');
  return game;
}
