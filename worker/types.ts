export interface Env {
  ASSETS: { fetch: typeof fetch };
  GITHUB_TOKEN: string;
  CAPTURE_TOKEN: string;
  GITHUB_REPO: string;
  SPARK_TIMEZONE: string;
  /** Override for local testing against a mock; defaults to api.github.com. */
  GITHUB_API?: string;
  /** Web push (optional until Phase 2 notifications are configured). */
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_JWK?: string;
  VAPID_SUBJECT?: string;
}
