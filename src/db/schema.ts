import { isSqliteDatabaseUrl } from "./driver";
import * as pg from "./schema-pg";
import * as sqlite from "./schema-sqlite";

const useSqlite = isSqliteDatabaseUrl();

/** Tipos alinhados ao PostgreSQL; runtime usa tabelas SQLite quando `file:`. */
export const user = (useSqlite ? sqlite.user : pg.user) as typeof pg.user;
export const session = (useSqlite ? sqlite.session : pg.session) as typeof pg.session;
export const account = (useSqlite ? sqlite.account : pg.account) as typeof pg.account;
export const verification = (useSqlite ? sqlite.verification : pg.verification) as typeof pg.verification;
export const tournaments = (useSqlite ? sqlite.tournaments : pg.tournaments) as typeof pg.tournaments;
export const teamsLibrary = (useSqlite ? sqlite.teamsLibrary : pg.teamsLibrary) as typeof pg.teamsLibrary;
export const groups = (useSqlite ? sqlite.groups : pg.groups) as typeof pg.groups;
export const players = (useSqlite ? sqlite.players : pg.players) as typeof pg.players;
export const matches = (useSqlite ? sqlite.matches : pg.matches) as typeof pg.matches;
export const goals = (useSqlite ? sqlite.goals : pg.goals) as typeof pg.goals;
export const matchHistory = (useSqlite ? sqlite.matchHistory : pg.matchHistory) as typeof pg.matchHistory;
export const achievements = (useSqlite ? sqlite.achievements : pg.achievements) as typeof pg.achievements;

export const userRelations = (useSqlite ? sqlite.userRelations : pg.userRelations) as typeof pg.userRelations;
export const matchHistoryRelations = (useSqlite
  ? sqlite.matchHistoryRelations
  : pg.matchHistoryRelations) as typeof pg.matchHistoryRelations;
export const sessionRelations = (useSqlite ? sqlite.sessionRelations : pg.sessionRelations) as typeof pg.sessionRelations;
export const accountRelations = (useSqlite ? sqlite.accountRelations : pg.accountRelations) as typeof pg.accountRelations;
export const teamsLibraryRelations = (useSqlite
  ? sqlite.teamsLibraryRelations
  : pg.teamsLibraryRelations) as typeof pg.teamsLibraryRelations;
export const tournamentsRelations = (useSqlite
  ? sqlite.tournamentsRelations
  : pg.tournamentsRelations) as typeof pg.tournamentsRelations;
export const groupsRelations = (useSqlite ? sqlite.groupsRelations : pg.groupsRelations) as typeof pg.groupsRelations;
export const playersRelations = (useSqlite ? sqlite.playersRelations : pg.playersRelations) as typeof pg.playersRelations;
export const matchesRelations = (useSqlite ? sqlite.matchesRelations : pg.matchesRelations) as typeof pg.matchesRelations;
export const goalsRelations = (useSqlite ? sqlite.goalsRelations : pg.goalsRelations) as typeof pg.goalsRelations;
export const achievementsRelations = (useSqlite
  ? sqlite.achievementsRelations
  : pg.achievementsRelations) as typeof pg.achievementsRelations;

export {
  achievementTypeEnum,
  matchHistoryResultEnum,
  matchStatusEnum,
  matchTypeEnum,
  teamLibraryCategoryEnum,
  tournamentStatusEnum,
} from "./schema-pg";
