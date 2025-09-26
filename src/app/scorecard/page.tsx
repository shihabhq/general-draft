"use client";

import { useEffect, useState } from "react";
import { getTeamStats, initializeAllTeams } from "@/lib/storage";
import type { TeamStats } from "@/lib/types";

export default function ScorecardPage() {
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);

  useEffect(() => {
    initializeAllTeams();
    const stats = getTeamStats();
    setTeamStats(stats); // removed manual sorting since getTeamStats now handles it
  }, []);

  const getPositionIcon = (position: number) => {
    return position.toString();
  };

  const getTotalGames = (stat: TeamStats) => {
    return stat.wins + stat.losses + stat.draws;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br my-10 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md border">
          <div className="p-6">
            <h2 className="text-xl text-blue-700 font-semibold mb-4">
              League Table
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700 w-16">
                      Pos
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">
                      Team
                    </th>
                    <th className="text-center p-3 font-semibold text-gray-700">
                      GP
                    </th>
                    <th className="text-center p-3 font-semibold text-gray-700">
                      W
                    </th>
                    <th className="text-center p-3 font-semibold text-gray-700">
                      D
                    </th>
                    <th className="text-center p-3 font-semibold text-gray-700">
                      L
                    </th>
                    <th className="text-center p-3 font-semibold text-gray-700">
                      GF
                    </th>
                    <th className="text-center p-3 font-semibold text-gray-700">
                      GA
                    </th>
                    <th className="text-center p-3 font-semibold text-gray-700">
                      GD
                    </th>

                    <th className="text-center p-3 font-semibold text-gray-700 font-bold">
                      Pts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teamStats.map((stat, index) => {
                    const position = index + 1;
                    const totalGames = getTotalGames(stat);
                    const goalDifference = stat.goalsFor - stat.goalsAgainst;

                    return (
                      <tr
                        key={stat.name}
                        className={`border-b border-gray-100  ${
                          position <= 4 ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {getPositionIcon(position)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold">{stat.name}</span>
                        </td>
                        <td className="text-center p-3">{totalGames}</td>
                        <td className="text-center p-3 text-green-600 font-semibold">
                          {stat.wins}
                        </td>
                        <td className="text-center p-3 text-yellow-600 font-semibold">
                          {stat.draws}
                        </td>
                        <td className="text-center p-3 text-red-600 font-semibold">
                          {stat.losses}
                        </td>
                        <td className="text-center p-3 text-blue-600 font-semibold">
                          {stat.goalsFor}
                        </td>
                        <td className="text-center p-3 text-red-500 font-semibold">
                          {stat.goalsAgainst}
                        </td>
                        <td
                          className={`text-center p-3 font-semibold ${
                            goalDifference >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {goalDifference >= 0 ? "+" : ""}
                          {goalDifference}
                        </td>

                        <td className="text-center p-3 font-bold text-lg text-purple-700">
                          {stat.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border">
          <div className="p-6">
            <div className="text-center text-gray-600">
              <p className="text-sm">
                <span className="font-semibold">GP:</span> Games Played |
                <span className="font-semibold"> W:</span> Wins |
                <span className="font-semibold"> D:</span> Draws |
                <span className="font-semibold"> L:</span> Losses |
                <span className="font-semibold"> GF:</span> Goals For |
                <span className="font-semibold"> GA:</span> Goals Against |
                <span className="font-semibold"> GD:</span> Goal Difference |
                <span className="font-semibold"> Goals:</span> Goals Scored |
                <span className="font-semibold"> Pts:</span> Points
              </p>
              <p className="text-xs mt-2 text-gray-500">
                Win = 3 points | Draw = 1 point | Loss = 0 points
              </p>
              <p className="text-xs mt-1 text-blue-600 font-medium">
                Top 4 teams qualify for semifinals
              </p>
              <p className="text-xs mt-1 text-gray-500">
                Teams are ranked by Points, then Goal Difference
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
