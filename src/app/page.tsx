"use client";

import { useState, useEffect, useRef } from "react";
import { TeamData } from "@/data/teamdata";
import type { GameState, GoalScorer, Card } from "@/lib/types";
import { saveGameResult, updateTeamStats } from "@/lib/storage";

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState>({
    homeTeam: null,
    awayTeam: null,
    homeScore: 0,
    awayScore: 0,
    timeLeft: 0,
    isRunning: false,
    isPaused: false,
    gameTime: 10,
    goalScorers: [],
    cards: [],
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showGoalScorerInput, setShowGoalScorerInput] = useState<{
    team: "home" | "away";
  } | null>(null);
  const [goalScorerName, setGoalScorerName] = useState("");
  const [showCardInput, setShowCardInput] = useState<{
    team: "home" | "away";
    type: "yellow" | "red";
  } | null>(null);
  const [cardPlayerName, setCardPlayerName] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState.isRunning && gameState.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState.isRunning, gameState.timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startGame = () => {
    if (!gameState.homeTeam || !gameState.awayTeam) return;

    setGameState((prev) => ({
      ...prev,
      timeLeft: prev.gameTime * 60,
      isRunning: true,
      isPaused: false,
    }));
    setGameStarted(true);
  };

  const pauseGame = () => {
    setGameState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: true,
    }));
  };

  const resumeGame = () => {
    setGameState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
    }));
  };

  const cancelGame = () => {
    setShowCancelModal(false);
    setGameState((prev) => ({
      ...prev,
      homeScore: 0,
      awayScore: 0,
      timeLeft: 0,
      isRunning: false,
      isPaused: false,
    }));
    setGameStarted(false);
  };

  const finishGame = () => {
    const now = new Date().toISOString();

    // Determine winner and loser
    let winner, loser, winnerScore, loserScore;
    if (gameState.homeScore > gameState.awayScore) {
      winner = gameState.homeTeam!.name;
      loser = gameState.awayTeam!.name;
      winnerScore = gameState.homeScore;
      loserScore = gameState.awayScore;
    } else if (gameState.awayScore > gameState.homeScore) {
      winner = gameState.awayTeam!.name;
      loser = gameState.homeTeam!.name;
      winnerScore = gameState.awayScore;
      loserScore = gameState.homeScore;
    } else {
      // Draw case
      winner = gameState.homeTeam!.name;
      loser = gameState.homeTeam!.name;
      winnerScore = gameState.homeScore;
      loserScore = gameState.awayScore;
    }

    saveGameResult({
      winner,
      loser,
      winnerScore,
      loserScore,
      date: now,
      goalScorers: gameState.goalScorers,
      cards: gameState.cards,
    });

    // Update team stats
    updateTeamStats(
      gameState.homeTeam!.name,
      gameState.awayTeam!.name,
      gameState.homeScore,
      gameState.awayScore
    );

    // Reset game
    setGameState((prev) => ({
      ...prev,
      homeScore: 0,
      awayScore: 0,
      timeLeft: 0,
      isRunning: false,
      isPaused: false,
      goalScorers: [],
      cards: [],
    }));
    setGameStarted(false);
  };

  const updateScore = (team: "home" | "away", increment: boolean) => {
    if (increment) {
      setShowGoalScorerInput({ team });
      setGoalScorerName("");
    } else {
      // Remove last goal scorer for this team when subtracting
      const teamName =
        team === "home" ? gameState.homeTeam?.name : gameState.awayTeam?.name;
      const updatedScorers = [...gameState.goalScorers];
      const lastScorerIndex = updatedScorers
        .map((s) => s.team)
        .lastIndexOf(teamName!);
      if (lastScorerIndex !== -1) {
        updatedScorers.splice(lastScorerIndex, 1);
      }

      setGameState((prev) => ({
        ...prev,
        [team === "home" ? "homeScore" : "awayScore"]: Math.max(
          0,
          prev[team === "home" ? "homeScore" : "awayScore"] - 1
        ),
        goalScorers: updatedScorers,
      }));
    }
  };

  const addGoalScorer = () => {
    if (!goalScorerName.trim() || !showGoalScorerInput) return;

    const teamName =
      showGoalScorerInput.team === "home"
        ? gameState.homeTeam?.name
        : gameState.awayTeam?.name;
    if (!teamName) return;

    const newScorer: GoalScorer = {
      name: goalScorerName.trim(),
      team: teamName,
    };

    setGameState((prev) => ({
      ...prev,
      [showGoalScorerInput.team === "home" ? "homeScore" : "awayScore"]:
        prev[showGoalScorerInput.team === "home" ? "homeScore" : "awayScore"] +
        1,
      goalScorers: [...prev.goalScorers, newScorer],
    }));

    setShowGoalScorerInput(null);
    setGoalScorerName("");
  };

  const removeGoalScorer = (index: number) => {
    const removedScorer = gameState.goalScorers[index];
    const updatedScorers = gameState.goalScorers.filter((_, i) => i !== index);

    // Decrease score for the team
    const isHomeTeam = removedScorer.team === gameState.homeTeam?.name;

    setGameState((prev) => ({
      ...prev,
      [isHomeTeam ? "homeScore" : "awayScore"]: Math.max(
        0,
        prev[isHomeTeam ? "homeScore" : "awayScore"] - 1
      ),
      goalScorers: updatedScorers,
    }));
  };

  const addCard = (team: "home" | "away", type: "yellow" | "red") => {
    setShowCardInput({ team, type });
    setCardPlayerName("");
  };

  const confirmAddCard = () => {
    if (!cardPlayerName.trim() || !showCardInput) return;

    const teamName =
      showCardInput.team === "home"
        ? gameState.homeTeam?.name
        : gameState.awayTeam?.name;
    if (!teamName) return;

    const newCard: Card = {
      playerName: cardPlayerName.trim(),
      team: teamName,
      type: showCardInput.type,
    };

    setGameState((prev) => ({
      ...prev,
      cards: [...prev.cards, newCard],
    }));

    setShowCardInput(null);
    setCardPlayerName("");
  };

  const removeCard = (index: number) => {
    const updatedCards = gameState.cards.filter((_, i) => i !== index);
    setGameState((prev) => ({
      ...prev,
      cards: updatedCards,
    }));
  };

  const isGameOver = gameState.timeLeft === 0 && gameStarted;

  return (
    <div className="min-h-screen bg-gradient-to-br p-4">
      <div className="max-w-4xl mx-auto space-y-6 my-20">
        {!gameStarted ? (
          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Setup Game</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="home-team"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Team 1
                    </label>
                    <select
                      id="home-team"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      onChange={(e) => {
                        const team = TeamData.find(
                          (t) => t.name === e.target.value
                        );
                        setGameState((prev) => ({
                          ...prev,
                          homeTeam: team || null,
                        }));
                      }}
                      value={gameState.homeTeam?.name || ""}
                    >
                      <option value="">Select Team 1</option>
                      {TeamData.map((team) => (
                        <option key={team.name} value={team.name}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="away-team"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Team 2
                    </label>
                    <select
                      id="away-team"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      onChange={(e) => {
                        const team = TeamData.find(
                          (t) => t.name === e.target.value
                        );
                        setGameState((prev) => ({
                          ...prev,
                          awayTeam: team || null,
                        }));
                      }}
                      value={gameState.awayTeam?.name || ""}
                    >
                      <option value="">Select Team 2</option>
                      {TeamData.filter(
                        (team) => team.name !== gameState.homeTeam?.name
                      ).map((team) => (
                        <option key={team.name} value={team.name}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="game-time"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Game Time (minutes)
                  </label>
                  <input
                    id="game-time"
                    type="number"
                    min="1"
                    max="90"
                    value={gameState.gameTime}
                    onChange={(e) =>
                      setGameState((prev) => ({
                        ...prev,
                        gameTime: Number.parseInt(e.target.value) || 10,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <button
                  onClick={startGame}
                  disabled={!gameState.homeTeam || !gameState.awayTeam}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-md transition-colors"
                >
                  Start Game
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timer Display */}
            <div className="bg-white rounded-lg shadow-md border">
              <div className="p-6 ">
                <div className="text-center relative ">
                  <div className="text-9xl font-bold text-green-800 mb-4">
                    {formatTime(gameState.timeLeft)}
                  </div>
                  <div className="flex justify-center flex-col gap-4 absolute right-0 top-0">
                    {!gameState.isRunning && !isGameOver ? (
                      <button
                        onClick={resumeGame}
                        className="bg-green-600 min-w-[90px] cursor-pointer hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center gap-2"
                      >
                        {gameState.isPaused ? "Resume" : "Start"}
                      </button>
                    ) : (
                      <button
                        onClick={pauseGame}
                        disabled={isGameOver}
                        className="bg-yellow-600 min-w-[90px] flex justify-center cursor-pointer hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors items-center gap-2"
                      >
                        Pause
                      </button>
                    )}
                    <button
                      onClick={() => setShowCancelModal(true)}
                      disabled={isGameOver}
                      className="bg-red-600 justify-center cursor-pointer min-w-[90px] hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center gap-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team */}
              <div className="bg-white rounded-lg shadow-md border">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Team Info - Left Side */}
                    <div
                      className="flex flex-col items-center"
                      style={{ color: gameState.homeTeam?.color }}
                    >
                      <h2 className=" text-2xl font-bold mb-4">
                        {gameState.homeTeam?.name}
                      </h2>
                      <div className="w-40 h-40 rounded-lg overflow-hidden shadow-md border">
                        <img
                          src={gameState.homeTeam?.image || "/placeholder.svg"}
                          alt={`${gameState.homeTeam?.name} jersey`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Goal Score - Right Side */}
                    <div className="text-center flex flex-col items-center">
                      <h3 className="text-gray-700 text-xl font-bold">Goals</h3>
                      <div className="text-8xl font-black text-gray-900 mb-6">
                        {gameState.homeScore}
                      </div>

                      {/* Score Controls */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => updateScore("home", false)}
                          disabled={isGameOver}
                          className="border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-semibold py-2 px-3 rounded-md transition-colors"
                        >
                          ➖
                        </button>
                        <button
                          onClick={() => updateScore("home", true)}
                          disabled={isGameOver}
                          className="border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-semibold py-2 px-3 rounded-md transition-colors"
                        >
                          ➕
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => addCard("home", "yellow")}
                          disabled={isGameOver}
                          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-100 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md transition-colors text-sm"
                        >
                          Yellow
                        </button>
                        <button
                          onClick={() => addCard("home", "red")}
                          disabled={isGameOver}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-100 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md transition-colors text-sm"
                        >
                          Red
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Away Team */}
              <div className="bg-white rounded-lg shadow-md border">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Team Info - Left Side */}
                    <div className="flex flex-col items-center">
                      <h2
                        className="text-2xl font-bold mb-4"
                        style={{ color: gameState.awayTeam?.color }}
                      >
                        {gameState.awayTeam?.name}
                      </h2>
                      <div className="w-40 h-40 rounded-lg overflow-hidden shadow-md border">
                        <img
                          src={gameState.awayTeam?.image || "/placeholder.svg"}
                          alt={`${gameState.awayTeam?.name} jersey`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Goal Score - Right Side */}
                    <div className="text-center flex flex-col items-center">
                      <h3 className="text-gray-700 text-xl font-bold">Goals</h3>
                      <div className="text-8xl font-black text-gray-900 mb-6">
                        {gameState.awayScore}
                      </div>

                      {/* Score Controls */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => updateScore("away", false)}
                          disabled={isGameOver}
                          className="border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-semibold py-2 px-3 rounded-md transition-colors"
                        >
                          ➖
                        </button>
                        <button
                          onClick={() => updateScore("away", true)}
                          disabled={isGameOver}
                          className="border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-semibold py-2 px-3 rounded-md transition-colors"
                        >
                          ➕
                        </button>
                      </div>

                      <div className="flex gap-2 w-full justify-center items-center">
                        <button
                          onClick={() => addCard("away", "yellow")}
                          disabled={isGameOver}
                          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-100 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md transition-colors text-sm"
                        >
                          Yellow
                        </button>
                        <button
                          onClick={() => addCard("away", "red")}
                          disabled={isGameOver}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-100 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md transition-colors text-sm"
                        >
                          Red
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {gameState.goalScorers.length > 0 && (
              <div className="bg-white rounded-lg shadow-md border">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Goal Scorers
                  </h3>
                  <div className=" flex items-center flex-wrap gap-4">
                    {gameState.goalScorers.map((scorer, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 justify-between bg-gray-50 p-3 rounded-md"
                      >
                        <span className="font-medium">{scorer.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            ({scorer.team})
                          </span>
                          <button
                            onClick={() => removeGoalScorer(index)}
                            disabled={isGameOver}
                            className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed font-bold text-lg"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {gameState.cards.length > 0 && (
              <div className="bg-white flex rounded-lg shadow-md border">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Cards
                  </h3>
                  <div className=" flex items-center flex-wrap gap-4">
                    {gameState.cards.map((card, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 justify-between bg-gray-50 p-3 rounded-md"
                      >
                        <span className="font-medium">{card.playerName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            ({card.team})
                          </span>
                          <span className="text-lg">
                            {card.type === "yellow" ? "🟨" : "🟥"}
                          </span>
                          <button
                            onClick={() => removeCard(index)}
                            disabled={isGameOver}
                            className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed font-bold text-lg"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Game Over Actions */}
            {isGameOver && (
              <div className="bg-white rounded-lg shadow-md border">
                <div className="p-6">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-green-800">
                      Game Over!
                    </h2>
                    <p className="text-lg">
                      {gameState.homeScore > gameState.awayScore
                        ? `${gameState.homeTeam?.name} wins!`
                        : gameState.awayScore > gameState.homeScore
                        ? `${gameState.awayTeam?.name} wins!`
                        : "It's a draw!"}
                    </p>
                    <button
                      onClick={finishGame}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center gap-2 mx-auto"
                    >
                      🔄 Finish & Play Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showGoalScorerInput && (
          <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">Add Goal Scorer</h3>
                <p className="text-gray-600 mb-4">
                  Who scored for{" "}
                  {showGoalScorerInput.team === "home"
                    ? gameState.homeTeam?.name
                    : gameState.awayTeam?.name}
                  ?
                </p>
                <input
                  type="text"
                  value={goalScorerName}
                  onChange={(e) => setGoalScorerName(e.target.value)}
                  placeholder="Enter player name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
                  onKeyPress={(e) => e.key === "Enter" && addGoalScorer()}
                  autoFocus
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowGoalScorerInput(null)}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addGoalScorer}
                    disabled={!goalScorerName.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors"
                  >
                    Add Goal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCardInput && (
          <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Add {showCardInput.type === "yellow" ? "Yellow" : "Red"} Card
                </h3>
                <p className="text-gray-600 mb-4">
                  Which player from{" "}
                  {showCardInput.team === "home"
                    ? gameState.homeTeam?.name
                    : gameState.awayTeam?.name}{" "}
                  received the {showCardInput.type} card?
                </p>
                <input
                  type="text"
                  value={cardPlayerName}
                  onChange={(e) => setCardPlayerName(e.target.value)}
                  placeholder="Enter player name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
                  onKeyPress={(e) => e.key === "Enter" && confirmAddCard()}
                  autoFocus
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowCardInput(null)}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAddCard}
                    disabled={!cardPlayerName.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors"
                  >
                    Add Card
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">Cancel Game?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to cancel the current game? All progress
                  will be lost.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-md transition-colors"
                  >
                    Continue Playing
                  </button>
                  <button
                    onClick={cancelGame}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                  >
                    Cancel Game
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
