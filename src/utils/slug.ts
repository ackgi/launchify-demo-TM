// launchify-bolt-next/src/utils/slug.ts

/**
 * Split a product slug into owner and name.
 * 
 * Example:
 *   "alice/weather-api" → { owner: "alice", name: "weather-api" }
 */
export function splitSlug(slug: string): { owner: string; name: string } {
  const parts = slug.split("/");
  if (parts.length !== 2) {
    throw new Error(
      `Invalid slug format: ${slug}. Expected format: "owner/name"`
    );
  }

  return {
    owner: parts[0],
    name: parts[1],
  };
}
