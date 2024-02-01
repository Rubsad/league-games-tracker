import { relations } from "drizzle-orm";
import {
  boolean,
  int,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

import { mySqlTable } from "./_table";

export const match = mySqlTable("match", {
  id: varchar("id", { length: 20 }).primaryKey().notNull(),
  player: varchar("player", { length: 78 }).notNull(),
  gameDate: timestamp("gameDate", { mode: "date" }).notNull(),
  gameDuration: int("gameDuration").notNull(),
  gameMode: varchar("gameMode", { length: 10 }).notNull(),
  cloud: int("cloud").default(0),
  infernal: int("infernal").default(0),
  mountain: int("mountain").default(0),
  ocean: int("ocean").default(0),
  chemtech: int("chemtech").default(0),
  hextech: int("hextech").default(0),
  soul: varchar("soul", { length: 8 }).default("none"),
});

export const participants = mySqlTable(
  "participants",
  {
    id: varchar("id", { length: 100 }).primaryKey().notNull(),
    matchId: varchar("matchId", { length: 20 }).notNull(),
    puuid: varchar("puuid", { length: 78 }).notNull(),
    summonerId: varchar("summonerId", { length: 50 }).notNull(),
    tier: varchar("tier", { length: 11 }).notNull(),
    rank: varchar("rank", { length: 4 }).notNull(),
    lp: int("lp").notNull(),
    teamId: int("teamId").notNull(),
    champion: varchar("champion", { length: 30 }),
    level: int("level").notNull(),
    kills: int("kills").notNull(),
    deaths: int("deaths").notNull(),
    assists: int("assists").notNull(),
    afk: boolean("afk").notNull(),
    totalMinionsKilled: int("totalMinionsKilled").notNull(),
    totalTimeSpentDead: int("totalTimeSpentDead").notNull(),
    tripleKills: int("tripleKills").default(0),
    quadraKills: int("quadraKills").default(0),
    pentaKills: int("pentaKills").default(0),
    win: boolean("win").notNull(),
    gameEndedInSurrender: boolean("gameEndedInSurrender").notNull(),
    physicalDamageDealtToChampions: int(
      "physicalDamageDealtToChampions",
    ).notNull(),
    magicDamageDealtToChampions: int("magicDamageDealtToChampions").notNull(),
    totalDamageDealtToChampions: int("totalDamageDealtToChampions").notNull(),
    largestCriticalStrike: int("largestCriticalStrike").notNull(),
    goldEarned: int("goldEarned").notNull(),
  },
  (participant) => ({
    unq: unique().on(participant.matchId, participant.puuid),
  }),
);

export const matchRelations = relations(match, ({ many }) => ({
  participants: many(participants),
}));

export const participantsRelations = relations(participants, ({ one }) => ({
  match: one(match, { fields: [participants.matchId], references: [match.id] }),
}));
