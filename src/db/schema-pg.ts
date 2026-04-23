import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const matchTypeEnum = pgEnum("match_type", ["GROUP", "KNOCKOUT"]);
export const matchStatusEnum = pgEnum("match_status", ["PENDING", "FINISHED"]);
export const tournamentStatusEnum = pgEnum("tournament_status", [
  "ACTIVE",
  "FINISHED",
]);
export const achievementTypeEnum = pgEnum("achievement_type", [
  "CHAMPION",
  "RUNNER_UP",
  "THIRD_PLACE",
  "TOP_SCORER",
  "FAN_FAVORITE",
  "MVP",
  "CRAQUE_DA_GALERA",
  "FAIR_PLAY",
]);

export const matchHistoryResultEnum = pgEnum("match_history_result", [
  "W",
  "D",
  "L",
]);

/** Clubes europeus (UCL) vs seleções (Copa do Mundo). */
export const teamLibraryCategoryEnum = pgEnum("team_library_category", [
  "EUROPE",
  "WORLD_CUP",
]);
export const userRoleEnum = pgEnum("user_role", ["ADMIN", "USER"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("USER"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
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
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  status: tournamentStatusEnum("status").notNull().default("ACTIVE"),
});

export const teamsLibrary = pgTable(
  "teams_library",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    logoUrl: text("logo_url").notNull(),
    category: teamLibraryCategoryEnum("category").notNull(),
  },
  (table) => [index("teams_library_category_idx").on(table.category)],
);

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  teamName: varchar("team_name", { length: 255 }).notNull(),
  teamLogo: varchar("team_logo", { length: 500 }),
  teamId: integer("team_id").references(() => teamsLibrary.id, {
    onDelete: "set null",
  }),
  groupId: integer("group_id").references(() => groups.id),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  playerHomeId: integer("player_home_id")
    .notNull()
    .references(() => players.id),
  playerAwayId: integer("player_away_id")
    .notNull()
    .references(() => players.id),
  scoreHome: integer("score_home").default(0).notNull(),
  scoreAway: integer("score_away").default(0).notNull(),
  type: matchTypeEnum("type").notNull(),
  stage: text("stage").notNull(),
  status: matchStatusEnum("status").default("PENDING").notNull(),
  groupId: integer("group_id").references(() => groups.id),
  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id),
  count: integer("count").notNull().default(0),
});

/** Uma linha por usuário por partida (consolidada na finalização oficial do torneio). */
export const matchHistory = pgTable(
  "match_history",
  {
    id: serial("id").primaryKey(),
    sourceMatchId: integer("source_match_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    result: matchHistoryResultEnum("result").notNull(),
    goals: integer("goals").notNull().default(0),
    tournamentName: varchar("tournament_name", { length: 255 }).notNull(),
    finishedAt: timestamp("finished_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("match_history_source_user_uidx").on(t.sourceMatchId, t.userId),
    index("match_history_user_id_idx").on(t.userId),
  ],
);

export const achievements = pgTable(
  "achievements",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tournamentId: integer("tournament_id")
      .notNull()
      .references(() => tournaments.id, { onDelete: "restrict" }),
    type: achievementTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
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
