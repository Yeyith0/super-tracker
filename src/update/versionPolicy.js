import { APP_VERSION, VERSION_POLICY_URL } from "../config";
import { validateVersionPolicy } from "../content/validate";
import { getJson } from "../lib/http";
import { compareVersions } from "./semver";
import { useUpdateStore } from "./useUpdateStore";

/** Pure check: is the running version below the policy's minimum? */
export function isBlockedByPolicy(policy, version = APP_VERSION) {
  return Boolean(policy) && compareVersions(version, policy.minimum) < 0;
}

/**
 * Fetches version-policy.json from the repo. Only a successful fetch can block the app; if the PC is
 * offline the app stays usable and the scheduler retries later. Dev builds are never blocked.
 * Returns true when the policy could be read.
 */
export async function checkVersionPolicy() {
  try {
    const policy = await getJson(VERSION_POLICY_URL);
    if (validateVersionPolicy(policy).length) return false;
    const blocked = isBlockedByPolicy(policy);
    if (blocked && import.meta.env.DEV) console.warn(`Version policy requires ${policy.minimum}; dev builds are not blocked.`);
    useUpdateStore.getState().update({ policy, policyBlocked: blocked && import.meta.env.PROD });
    return true;
  } catch {
    return false;
  }
}
