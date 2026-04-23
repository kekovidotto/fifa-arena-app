import { relations } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["ADMIN", "USER"] }).notNull().default("USER"),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const tournaments = sqliteTable("tournaments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }).notNull(),
  date: integer("date", { mode: "timestamp" }).notNull().defaultNow(),
  status: text("status", { enum: ["ACTIVE", "FINISHED"] })
    .notNull()
    .default("ACTIVE"),
});

export const teamsLibrary = sqliteTable(
  "teams_library",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name", { length: 255 }).notNull(),
    logoUrl: text("logo_url").notNull(),
    category: text("category", { enum: ["EUROPE", "WORLD_CUP"] }).notNull(),
  },
  (table) => [index("teams_library_category_idx").on(table.category)],
);

export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 50 }).notNull(),
  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
});

export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }).notNull(),
  teamName: text("team_name", { length: 255 }).notNull(),
  teamLogo: text("team_logo", { length: 500 }),
  teamId: integer("team_id").references(() => teamsLibrary.id, {
    onDelete: "set null",
  }),
  groupId: integer("group_id").references(() => groups.id),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
});

export const matches = sqliteTable("matches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playerHomeId: integer("player_home_id")
    .notNull()
    .references(() => players.id),
  playerAwayId: integer("player_away_id")
    .notNull()
    .references(() => players.id),
  scoreHome: integer("score_home").default(0).notNull(),
  scoreAway: integer("score_away").default(0).notNull(),
  type: text("type", { enum: ["GROUP", "KNOCKOUT"] }).notNull(),
  stage: text("stage").notNull(),
  status: text("status", { enum: ["PENDING", "FINISHED"] })
    .default("PENDING")
    .notNull(),
  groupId: integer("group_id").references(() => groups.id),
  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
});

export const goals = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id),
  count: integer("count").notNull().default(0),
});

export const matchHistory = sqliteTable(
  "match_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sourceMatchId: integer("source_match_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    result: text("result", { enum: ["W", "D", "L"] }).notNull(),
    goals: integer("goals").notNull().default(0),
    tournamentName: text("tournament_name", { length: 255 }).notNull(),
    finishedAt: integer("finished_at", { mode: "timestamp" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("match_history_source_user_uidx").on(t.sourceMatchId, t.userId),
    index("match_history_user_id_idx").on(t.userId),
  ],
);

export const achievements = sqliteTable(
  "achievements",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tournamentId: integer("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "restrict" }),
    type: text("type", {
      enum: [
        "CHAMPION",
        "RUNNER_UP",
        "THIRD_PLACE",
        "TOP_SCORER",
        "FAN_FAVORITE",
        "MVP",
        "CRAQUE_DA_GALERA",
        "FAIR_PLAY",
      ],
    }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("achievements_user_tournament_type_uidx").on(
      t.userId,
      t.tournamentId,
      t.type,
    ),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  achievements: many(achievements),
  matchHistoryRows: many(matchHistory),
}));

export const matchHistoryRelations = relations(matchHistory, ({ one }) => ({
  appUser: one(user, {
    fields: [matchHistory.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const teamsLibraryRelations = relations(teamsLibrary, ({ many }) => ({
  players: many(players),
}));

export const tournamentsRelations = relations(tournaments, ({ many }) => ({
  groups: many(groups),
  matches: many(matches),
  achievements: many(achievements),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [groups.tournamentId],
    references: [tournaments.id],
  }),
  players: many(players),
  matches: many(matches),
}));

export const playersRelations = relations(players, ({ one }) => ({
  group: one(groups, {
    fields: [players.groupId],
    references: [groups.id],
  }),
  libraryTeam: one(teamsLibrary, {
    fields: [players.teamId],
    references: [teamsLibrary.id],
  }),
  appUser: one(user, {
    fields: [players.userId],
    references: [user.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [matches.tournamentId],
    references: [tournaments.id],
  }),
  group: one(groups, {
    fields: [matches.groupId],
    references: [groups.id],
  }),
  goals: many(goals),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  match: one(matches, {
    fields: [goals.matchId],
    references: [matches.id],
  }),
  player: one(players, {
    fields: [goals.playerId],
    references: [players.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(user, {
    fields: [achievements.userId],
    references: [user.id],
  }),
  tournament: one(tournaments, {
    fields: [achievements.tournamentId],
    references: [tournaments.id],
  }),
}));
