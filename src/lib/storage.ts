import type { GameResult, TeamStats } from "./types";
import { TeamData } from "@/data/teamdata";

export const STORAGE_KEYS = {
  SCORES: "football_scores",
  TEAM_STATS: "football_team_stats",
};

export function saveGameResult(result: GameResult): void {
  const existingScores = getGameResults();
  existingScores.push(result);
  localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(existingScores));
}

export function getGameResults(): GameResult[] {
  if (typeof window === "undefined") return [];
  const scores = localStorage.getItem(STORAGE_KEYS.SCORES);
  return scores ? JSON.parse(scores) : [];
}

export function updateTeamStats(
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number
): void {
  const existingStats = getTeamStats();

  // Find or create team stats
  let homeStats = existingStats.find((stat) => stat.name === homeTeam);
  let awayStats = existingStats.find((stat) => stat.name === awayTeam);

  if (!homeStats) {
    homeStats = {
      name: homeTeam,
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      get goalDifference() {
        return this.goalsFor - this.goalsAgainst;
      },
    };
    existingStats.push(homeStats);
  }

  if (!awayStats) {
    awayStats = {
      name: awayTeam,
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      get goalDifference() {
        return this.goalsFor - this.goalsAgainst;
      },
    };
    existingStats.push(awayStats);
  }

  // Update goals
  homeStats.goalsFor += homeScore;
  homeStats.goalsAgainst += awayScore;
  awayStats.goalsFor += awayScore;
  awayStats.goalsAgainst += homeScore;

  // Update wins/losses/draws and points
  if (homeScore > awayScore) {
    homeStats.wins++;
    homeStats.points += 3;
    awayStats.losses++;
  } else if (awayScore > homeScore) {
    awayStats.wins++;
    awayStats.points += 3;
    homeStats.losses++;
  } else {
    homeStats.draws++;
    homeStats.points += 1;
    awayStats.draws++;
    awayStats.points += 1;
  }

  localStorage.setItem(STORAGE_KEYS.TEAM_STATS, JSON.stringify(existingStats));
}

export function getTeamStats(): TeamStats[] {
  if (typeof window === "undefined") return [];
  const stats = localStorage.getItem(STORAGE_KEYS.TEAM_STATS);
  const rawStats: Omit<TeamStats, "goalDifference">[] = stats
    ? JSON.parse(stats)
    : [];

  return rawStats
    .map(
      (stat): TeamStats => ({
        ...stat,
        get goalDifference() {
          return this.goalsFor - this.goalsAgainst;
        },
      })
    )
    .sort((a, b) => {
      // Sort by points first, then by goal difference
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.goalDifference - a.goalDifference;
    });
}

export function initializeAllTeams(): void {
  const existingStats = getTeamStats();

  // Add any teams that don't exist in stats yet
  TeamData.forEach((team) => {
    const existingTeam = existingStats.find((stat) => stat.name === team.name);
    if (!existingTeam) {
      existingStats.push({
        name: team.name,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        get goalDifference() {
          return this.goalsFor - this.goalsAgainst;
        },
      });
    }
  });

  localStorage.setItem(STORAGE_KEYS.TEAM_STATS, JSON.stringify(existingStats));
}
