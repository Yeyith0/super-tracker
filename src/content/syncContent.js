import { CONTENT_BASE_URL } from "../config";
import { getJson } from "../lib/http";
import { CONTENT_NAMES, useContentStore } from "./useContentStore";
import { validateContent } from "./validate";

/**
 * Downloads content/<name>.json for every known file from the GitHub repo and keeps each copy that is
 * valid and newer than the current one. Offline or invalid files leave the bundled / cached copy in use.
 * Returns true when every file could be checked.
 */
export async function syncContent() {
  const { applyRemote, setStatus } = useContentStore.getState();
  const errors = [];

  await Promise.all(
    CONTENT_NAMES.map(async (name) => {
      try {
        const data = await getJson(`${CONTENT_BASE_URL}/${name}.json`);
        const problems = validateContent(name, data);
        if (problems.length) errors.push(`${name}.json rejected: ${problems[0]}`);
        else applyRemote(name, data);
      } catch (error) {
        errors.push(`${name}.json: ${error.message ?? error}`);
      }
    }),
  );

  setStatus({ lastCheckAt: Date.now(), lastError: errors[0] ?? null });
  return errors.length === 0;
}
