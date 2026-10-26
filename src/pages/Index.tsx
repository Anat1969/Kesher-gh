import { useMemo } from 'react';
import SplashScreen from '../components/SplashScreen';
import GameScreen from '../components/GameScreen';
import ResultsScreen from '../components/ResultsScreen';
import { useGameState } from '../hooks/useGameState';

const Index = () => {
  const game = useGameState();
  const { state, stats, settings, updateSettings } = game;
  const knownSecrets = useMemo(() => new Set(stats.secrets), [stats.secrets]);

  if (state.screen === 'splash') {
    return <SplashScreen stats={stats} settings={settings} onStart={game.startGame} onSettings={updateSettings} />;
  }

  if (state.screen === 'results') {
    return (
      <ResultsScreen
        directConns={state.directConns}
        chainConns={state.chainConns}
        score={state.score}
        chainScore={state.chainScore}
        stats={stats}
        record={game.lastRecord}
        onPlayAgain={game.startGame}
        onMenu={game.resetGame}
      />
    );
  }

  return (
    <GameScreen
      state={state}
      totalScore={game.totalScore}
      currentMilestone={game.currentMilestone}
      nextMilestone={game.nextMilestone}
      settings={settings}
      knownSecrets={knownSecrets}
      onPick={game.pick}
      onPause={game.pause}
      onResume={game.resume}
      onFinish={game.finish}
      onMenu={game.resetGame}
      onSettings={updateSettings}
    />
  );
};

export default Index;
