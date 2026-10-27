import { useEffect, useMemo } from 'react';
import SplashScreen from '../components/SplashScreen';
import GameScreen from '../components/GameScreen';
import ResultsScreen from '../components/ResultsScreen';
import { useGame } from '../context/GameContext';

const Index = () => {
  const game = useGame();
  const { state, stats, settings, updateSettings, pause } = game;
  const knownSecrets = useMemo(() => new Set(stats.secrets), [stats.secrets]);

  // Leaving the board for another page stops the clock.
  useEffect(() => () => pause(), [pause]);

  if (state.screen === 'splash') {
    return <SplashScreen stats={stats} onStart={game.startGame} onDaily={game.startDaily} dailyResults={game.dailyResults} />;
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
        daily={state.mode === 'daily' ? state.daily : null}
        path={state.path}
        onDaily={game.startDaily}
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
      onAnnotate={game.annotate}
    />
  );
};

export default Index;
