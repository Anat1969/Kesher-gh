import SplashScreen from '../components/SplashScreen';
import GameScreen from '../components/GameScreen';
import ResultsScreen from '../components/ResultsScreen';
import { useGameState } from '../hooks/useGameState';

const Index = () => {
  const { state, totalScore, currentMilestone, nextMilestone, scorePopRef, scorePopKey, chainToast, startGame, resetGame, pick } = useGameState();

  if (state.screen === 'splash') {
    return <SplashScreen onStart={startGame} />;
  }

  if (state.screen === 'results') {
    return (
      <ResultsScreen
        directConns={state.directConns}
        chainConns={state.chainConns}
        score={state.score}
        chainScore={state.chainScore}
        onPlayAgain={resetGame}
      />
    );
  }

  return (
    <GameScreen
      state={state}
      totalScore={totalScore}
      currentMilestone={currentMilestone}
      nextMilestone={nextMilestone}
      scorePopRef={scorePopRef}
      scorePopKey={scorePopKey}
      chainToast={chainToast}
      onPick={pick}
    />
  );
};

export default Index;
