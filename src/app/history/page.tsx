"use client";

import { useEffect, useState } from "react";
import { getGameResults } from "@/lib/storage";
import { TeamData } from "@/data/teamdata";
import type { GameResult } from "@/lib/types";

export default function HistoryPage() {
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  useEffect(() => {
    setGameResults(getGameResults());
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isDraw = (result: GameResult) => {
    return result.winnerScore === result.loserScore;
  };

  const filteredResults =
    selectedTeam === "all"
      ? gameResults
      : gameResults.filter(
          (result) =>
            result.winner === selectedTeam || result.loser === selectedTeam
        );

  return (
    <div className="min-h-screen bg-gradient-to-br my-8 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md border">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <label
                htmlFor="team-filter"
                className="text-sm font-medium text-gray-700"
              >
                Filter by team:
              </label>
              <select
                id="team-filter"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Teams</option>
                {TeamData.map((team) => (
                  <option key={team.name} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
              {selectedTeam !== "all" && (
                <span className="text-sm text-gray-600">
                  Showing {filteredResults.length} game
                  {filteredResults.length !== 1 ? "s" : ""} for {selectedTeam}
                </span>
              )}
            </div>
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4 opacity-50">⚽</div>
                <p className="text-lg">
                  {selectedTeam === "all"
                    ? "No games played yet!"
                    : `No games found for ${selectedTeam}!`}
                </p>
                <p>
                  {selectedTeam === "all"
                    ? "Start playing games to see the history here."
                    : "This team hasn't played any games yet."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResults
              .slice()
              .reverse()
              .map((result, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📅</span>
                        <span className="text-sm text-gray-600">
                          {formatDate(result.date)}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="text-center">
                          {isDraw(result) ? (
                            <div className="space-y-2">
                              <span className="inline-block bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded mb-2">
                                DRAW
                              </span>
                              <div className="flex items-center justify-center gap-4">
                                <div className="text-right">
                                  <div className="font-semibold text-lg">
                                    {result.winner}
                                  </div>
                                  <div className="text-2xl font-bold text-blue-600">
                                    {result.winnerScore}
                                  </div>
                                </div>
                                <div className="text-2xl font-bold text-gray-400">
                                  -
                                </div>
                                <div className="text-left">
                                  <div className="font-semibold text-lg">
                                    {result.loser}
                                  </div>
                                  <div className="text-2xl font-bold text-blue-600">
                                    {result.loserScore}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <span className="inline-block bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded mb-2">
                                {result.winner} WINS
                              </span>
                              <div className="flex items-center justify-center gap-4">
                                <div className="text-right">
                                  <div className="font-semibold text-lg text-green-700">
                                    {result.winner}
                                  </div>
                                  <div className="text-2xl font-bold text-green-600">
                                    {result.winnerScore}
                                  </div>
                                </div>
                                <div className="text-2xl font-bold text-gray-400">
                                  -
                                </div>
                                <div className="text-left">
                                  <div className="font-semibold text-lg text-red-700">
                                    {result.loser}
                                  </div>
                                  <div className="text-2xl font-bold text-red-600">
                                    {result.loserScore}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Game #
                          {gameResults.length - gameResults.indexOf(result)}
                        </div>
                      </div>
                    </div>

                    {result.goalScorers && result.goalScorers.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Goal Scorers:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.goalScorers.map((scorer, scorerIndex) => (
                            <span
                              key={scorerIndex}
                              className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                            >
                              ⚽ {scorer.name} ({scorer.team})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.cards && result.cards.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Cards:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.cards.map((card, cardIndex) => (
                            <span
                              key={cardIndex}
                              className={`inline-block text-white text-xs px-2 py-1 rounded ${
                                card.type === "yellow"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            >
                              {card.type === "yellow" ? "🟨" : "🟥"}{" "}
                              {card.playerName} ({card.team})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {gameResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6">
              <div className="text-center text-gray-600">
                <p className="text-sm">
                  Total games played:{" "}
                  <span className="font-semibold">{gameResults.length}</span>
                  {selectedTeam !== "all" && (
                    <span>
                      {" "}
                      | Showing:{" "}
                      <span className="font-semibold">
                        {filteredResults.length}
                      </span>{" "}
                      for {selectedTeam}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
