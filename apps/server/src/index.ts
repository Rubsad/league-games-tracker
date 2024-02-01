import * as Http from "@effect/platform/HttpClient";
import * as Schema from "@effect/schema/Schema";
import { Config, Effect } from "effect";

export const name = "server";

const puuid =
  "U1IuB-stm8VoRT4E-RBQ13MLtAH3-3v_TFEZRLQz2iX9KXo6FxPDr5GG8vGfl3TZ5KfDsMApqVmVww";

const listSchema = Schema.array(Schema.string);

const matchSchema = Schema.struct({
  metadata: Schema.struct({ matchId: Schema.string }),
  info: Schema.struct({
    gameEndTimestamp: Schema.number,
    gameDuration: Schema.number,
    gameMode: Schema.string,
    participants: Schema.array(
      Schema.struct({
        puuid: Schema.string,
        summonerId: Schema.string,
        teamId: Schema.number,
        championName: Schema.string,
        champLevel: Schema.number,
        kills: Schema.number,
        deaths: Schema.number,
        assists: Schema.number,
        eligibleForProgression: Schema.boolean, // Afk or not
        totalMinionsKilled: Schema.number,
        totalTimeSpentDead: Schema.number,
        tripleKills: Schema.number,
        quadraKills: Schema.number,
        pentaKills: Schema.number,
        win: Schema.boolean,
        gameEndedInSurrender: Schema.boolean,
        physicalDamageDealtToChampions: Schema.number,
        magicDamageDealtToChampions: Schema.number,
        totalDamageDealtToChampions: Schema.number,
        largestCriticalStrike: Schema.number,
        goldEarned: Schema.number,
      }),
    ),
  }),
});

const timelineSchema = Schema.struct({
  info: Schema.struct({
    frames: Schema.array(
      Schema.struct({
        events: Schema.array(
          Schema.struct({
            name: Schema.optional(Schema.string),
            killerTeamId: Schema.optional(Schema.number),
            teamId: Schema.optional(Schema.number),
            monsterSubType: Schema.optional(Schema.string),
            monsterType: Schema.optional(Schema.string),
            type: Schema.string,
          }),
        ),
      }),
    ),
  }),
});

const rankSchema = Schema.array(
  Schema.struct({
    queueType: Schema.string,
    tier: Schema.string,
    rank: Schema.string,
    leaguePoints: Schema.number,
  }),
);

const getMatchIds = (puuid: string, start: number, count: number) => {
  return Config.string("RIOT_TOKEN").pipe(
    Effect.flatMap((token) =>
      Http.request
        .get(
          `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`,
        )
        .pipe(
          Http.request.appendUrlParam("start", start.toString()),
          Http.request.appendUrlParam("count", count.toString()),
          Http.request.setHeader("X-Riot-Token", token),
        )
        .pipe(Http.client.fetch())
        .pipe(Effect.flatMap(Http.response.schemaBodyJson(listSchema))),
    ),
  );
};

const getMatch = (matchId: string) => {
  return Config.string("RIOT_TOKEN").pipe(
    Effect.flatMap((token) =>
      Http.request
        .get(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`)
        .pipe(Http.request.setHeader("X-Riot-Token", token))
        .pipe(Http.client.fetch())
        .pipe(Effect.flatMap(Http.response.schemaBodyJson(matchSchema))),
    ),
  );
};

const getMatchTimeline = (matchId: string) => {
  return Config.string("RIOT_TOKEN").pipe(
    Effect.flatMap((token) =>
      Http.request
        .get(
          `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`,
        )
        .pipe(Http.request.setHeader("X-Riot-Token", token))
        .pipe(Http.client.fetch())
        .pipe(Effect.flatMap(Http.response.schemaBodyJson(timelineSchema))),
    ),
  );
};

const _getRank = (summonerId: string) => {
  return Config.string("RIOT_TOKEN").pipe(
    Effect.flatMap((token) =>
      Http.request
        .get(
          `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
        )
        .pipe(Http.request.setHeader("X-Riot-Token", token))
        .pipe(Http.client.fetch())
        .pipe(Effect.flatMap(Http.response.schemaBodyJson(rankSchema))),
    ),
  );
};

const matches = getMatchIds(puuid, 0, 2).pipe(
  Effect.flatMap((matchIds) => Effect.all(matchIds.map(getMatch))),
);

Effect.runPromise(
  matches.pipe(Effect.flatMap((x) => Effect.succeed(x[0]?.info))),
)
  .then(console.log)
  .catch(console.error);

const dragons = getMatchIds(puuid, 0, 2).pipe(
  Effect.flatMap((matchIds) => Effect.all(matchIds.map(getMatchTimeline))),
);

Effect.runPromise(
  dragons.pipe(
    Effect.flatMap((x) =>
      Effect.succeed(
        x.map((y) =>
          y.info.frames
            .filter((z) =>
              z.events.find(
                (f) =>
                  f.type === "ELITE_MONSTER_KILL" ||
                  f.type === "DRAGON_SOUL_GIVEN",
              ),
            )
            .map((g) =>
              g.events.filter(
                (h) =>
                  (h.type === "ELITE_MONSTER_KILL" &&
                    h.monsterType === "DRAGON") ||
                  h.type === "DRAGON_SOUL_GIVEN",
              ),
            ),
        ),
      ),
    ),
  ),
)
  .then((x) => console.log(JSON.stringify(x, null, 2)))
  .catch(console.error);
