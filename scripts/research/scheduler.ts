// Scheduling: which countries are due (tier interval) and which (city, category) to run next
// (least-recently-run rotation from the task ledger, §4 §5). Pure functions over the ledger.
import {
  Category,
  CountryProfile,
  OrchestratorConfig,
  allCountryCodes,
  loadCountry,
} from "./config";
import { TaskRecord, allTasks, taskId } from "./store";

export interface PlannedTask {
  country: string; // code
  city: string;
  category: Category;
}

const lastStartFor = (tasks: TaskRecord[], pred: (t: TaskRecord) => boolean): number => {
  let max = 0;
  for (const t of tasks)
    if (pred(t)) {
      const ts = Date.parse(t.startedAt);
      if (ts > max) max = ts;
    }
  return max;
};

// A country is due when the tier interval has elapsed since its last run (or it never ran).
export function dueCountries(cfg: OrchestratorConfig, now = Date.now()): CountryProfile[] {
  const tasks = allTasks();
  return allCountryCodes()
    .map(loadCountry)
    .filter((p) => {
      const intervalDays = cfg.tierIntervalDays[String(p.tier)] ?? 7;
      const last = lastStartFor(tasks, (t) => t.country === p.code);
      if (!last) return true;
      return now - last >= intervalDays * 86_400_000;
    });
}

// Rotation matrix = importable cities × categories, ordered least-recently-run first.
export function rotationOrder(profile: CountryProfile): PlannedTask[] {
  const tasks = allTasks();
  const cities = profile.cities.filter((c) => c.appImportable).map((c) => c.id);
  const cats = profile.categories;
  const combos: { task: PlannedTask; last: number }[] = [];
  for (const city of cities)
    for (const category of cats)
      combos.push({
        task: { country: profile.code, city, category },
        last: lastStartFor(
          tasks,
          (t) => t.country === profile.code && t.city === city && t.category === category,
        ),
      });
  // least-recently-run first; tie-break stable by insertion order for balance
  return combos
    .map((c, i) => ({ ...c, i }))
    .sort((a, b) => a.last - b.last || a.i - b.i)
    .map((c) => c.task);
}

// Next N rotation slots for a country (default 1 → spreads coverage, keeps quota low).
export function nextTasks(profile: CountryProfile, n = 1): PlannedTask[] {
  return rotationOrder(profile).slice(0, Math.max(1, n));
}

// Recent native queries already used for this city — passed to discover to avoid repeats (§5).
export function recentQueries(country: string, city: string, limit = 12): string[] {
  const seen: string[] = [];
  const runs = allTasks()
    .filter((t) => t.country === country && t.city === city)
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  for (const r of runs) {
    const q = (r.output as { queriesUsed?: string[] } | undefined)?.queriesUsed;
    if (Array.isArray(q)) for (const s of q) if (!seen.includes(s)) seen.push(s);
    if (seen.length >= limit) break;
  }
  return seen.slice(0, limit);
}

// Explicit single task (research:country -- JP tokyo PHOTO), validated against the profile.
export function explicitTask(
  country: string,
  city: string | undefined,
  category: string | undefined,
): PlannedTask {
  const profile = loadCountry(country);
  const importable = profile.cities.filter((c) => c.appImportable).map((c) => c.id);
  const chosenCity = city ?? nextTasks(profile, 1)[0].city;
  if (city && !importable.includes(city))
    throw new Error(`City "${city}" is not an importable ${country} city (${importable.join(", ")})`);
  const cat = (category ?? nextTasks(profile, 1)[0].category) as Category;
  if (!profile.categories.includes(cat))
    throw new Error(`Category "${cat}" not in ${country} profile (${profile.categories.join(", ")})`);
  return { country: profile.code, city: chosenCity, category: cat };
}

// re-export so the entry can build a taskId without importing store directly
export { taskId };
