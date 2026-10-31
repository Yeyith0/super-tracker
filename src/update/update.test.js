import { readFileSync } from "node:fs";
import { join } from "node:path";
import pkg from "../../package.json";
import tauriConf from "../../src-tauri/tauri.conf.json";
import releaseConf from "../../src-tauri/tauri.release.conf.json";
import capability from "../../src-tauri/capabilities/default.json";
import { GITHUB_REPO } from "../config";
import { compareVersions, isValidVersion, parseVersion } from "./semver";
import { isBlockedByPolicy } from "./versionPolicy";

describe("semver", () => {
  it("parses and compares versions", () => {
    expect(parseVersion("v1.2.3")).toEqual([1, 2, 3]);
    expect(compareVersions("0.1.0", "0.1.1")).toBe(-1);
    expect(compareVersions("0.10.0", "0.9.9")).toBe(1);
    expect(compareVersions("1.0.0", "v1.0.0")).toBe(0);
    expect(compareVersions("garbage", "0.0.1")).toBe(-1);
    expect(isValidVersion("0.2.0")).toBe(true);
    expect(isValidVersion("v0.2")).toBe(false);
  });
});

describe("version policy", () => {
  it("blocks only versions below the minimum", () => {
    expect(isBlockedByPolicy({ minimum: "0.1.1" }, "0.1.0")).toBe(true);
    expect(isBlockedByPolicy({ minimum: "0.1.1" }, "0.1.1")).toBe(false);
    expect(isBlockedByPolicy({ minimum: "0.1.0" }, "0.2.0")).toBe(false);
    expect(isBlockedByPolicy(null, "0.1.0")).toBe(false);
  });
});

describe("release configuration", () => {
  it("uses the same version everywhere", () => {
    // Vitest runs from the project root.
    const cargo = readFileSync(join(process.cwd(), "src-tauri/Cargo.toml"), "utf8");
    expect(tauriConf.version).toBe(pkg.version);
    expect(cargo).toMatch(new RegExp(`\\[package\\][^[]*?\\nversion = "${pkg.version.replace(/\./g, "\\.")}"`));
  });

  it("points the updater and the http scope at the same repository", () => {
    expect(tauriConf.plugins.updater.endpoints).toEqual([`https://github.com/${GITHUB_REPO}/releases/latest/download/latest.json`]);
    expect(tauriConf.plugins.updater.pubkey).toMatch(/^[A-Za-z0-9+/=]{40,}$/);
    const http = capability.permissions.find((p) => p.identifier === "http:default");
    expect(http.allow).toEqual([{ url: `https://raw.githubusercontent.com/${GITHUB_REPO}/main/*` }]);
  });

  it("creates signed updater artifacts only in the CI release config", () => {
    expect(tauriConf.bundle.createUpdaterArtifacts).toBeUndefined();
    expect(releaseConf.bundle.createUpdaterArtifacts).toBe(true);
  });
});
