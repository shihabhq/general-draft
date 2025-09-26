export interface Team {
  name: string;
  image: string;
  color: string;
}

export interface GoalScorer {
  name: string;
  team: string;
}

export interface GameResult {
  winner: string;
  loser: string;
  winnerScore: number;
  loserScore: number;
  date: string;
  goalScorers: GoalScorer[];
  cards: Card[];
}

export interface TeamStats {
  name: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  get goalDifference(): number;
}

export interface GameState {
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore: number;
  awayScore: number;
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  gameTime: number;
  goalScorers: GoalScorer[];
  cards: Card[];
}

export interface Card {
  playerName: string;
  team: string;
  type: "yellow" | "red";
}
