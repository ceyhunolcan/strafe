// ─── src/github/fetch-contributions.ts ────────────────────────────────
//
// Fetches a user's contribution graph from GitHub via the GraphQL API.
// Returns a structured array of 7 rows × 52 weeks, where each cell has
// a date, a count of contributions, and a "level" 0-4 matching how
// GitHub colors its own contribution graph.
//
// THIS IS THE HARDEST FILE TO UNDERSTAND IN THE WHOLE PROJECT.
// After this works, the rest is just drawing on a grid.
// ──────────────────────────────────────────────────────────────────────

import { graphql } from "@octokit/graphql";

// The GraphQL query GitHub exposes for contribution data.
// You can paste this into https://docs.github.com/en/graphql/overview/explorer
// and run it interactively with your token to see what it returns.
const CONTRIBUTIONS_QUERY = `
  query ($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

// What a single cell on the contribution grid looks like in our app.
export type Cell = {
  date: string;       // ISO date, e.g. "2026-05-27"
  count: number;      // number of contributions that day
  level: 0 | 1 | 2 | 3 | 4;  // intensity bucket (GitHub's 5-step scale)
};

// What we hand back to the rest of the program: a 2D grid.
// Rows are days of the week (0=Sunday ... 6=Saturday).
// Columns are weeks, oldest on the left.
export type Grid = {
  totalContributions: number;
  cells: Cell[][];  // cells[dayOfWeek][weekIndex]
};

// GitHub's GraphQL response uses string enums for levels — convert to numbers.
function levelFromEnum(level: string): 0 | 1 | 2 | 3 | 4 {
  switch (level) {
    case "NONE":          return 0;
    case "FIRST_QUARTILE":  return 1;
    case "SECOND_QUARTILE": return 2;
    case "THIRD_QUARTILE":  return 3;
    case "FOURTH_QUARTILE": return 4;
    default:                return 0;
  }
}

/**
 * Fetch a user's contribution grid from GitHub.
 *
 * @param username - GitHub username (e.g. "ceyhunolcan")
 * @param token - GitHub personal access token with `read:user` scope
 * @returns A Grid object structured for easy rendering
 */
export async function fetchContributions(
  username: string,
  token: string
): Promise<Grid> {
  // Set up the authenticated graphql client.
  const client = graphql.defaults({
    headers: { authorization: `bearer ${token}` },
  });

  // Run the query.
  const response: any = await client(CONTRIBUTIONS_QUERY, { username });

  // The response shape is nested — pull out the parts we care about.
  const calendar = response.user.contributionsCollection.contributionCalendar;

  // GitHub returns weeks as an array of objects, each with contributionDays.
  // We want to flip this into rows = days of week, columns = weeks.
  // Build a 7×N matrix.
  const cells: Cell[][] = Array.from({ length: 7 }, () => []);

  for (const week of calendar.weeks) {
    for (const day of week.contributionDays) {
      // JavaScript's getDay(): 0 = Sunday, 6 = Saturday
      const dayOfWeek = new Date(day.date).getUTCDay();
      cells[dayOfWeek].push({
        date: day.date,
        count: day.contributionCount,
        level: levelFromEnum(day.contributionLevel),
      });
    }
  }

  return {
    totalContributions: calendar.totalContributions,
    cells,
  };
}
