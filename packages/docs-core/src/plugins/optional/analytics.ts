/**
 * @oxog/docs-core - Analytics Plugin
 * Privacy-friendly analytics
 */

import type { DocsPlugin } from "../../types.js";

/**
 * Analytics plugin options
 */
export interface AnalyticsOptions {
  /** Analytics provider */
  provider?: "plausible" | "umami" | "fathom" | "custom";

  /** Site ID / Domain */
  domain: string;

  /** API URL (for self-hosted) */
  apiUrl?: string;

  /** Tracking script URL */
  scriptUrl?: string;

  /** Whether to track hash routes */
  trackHash?: boolean;

  /** Whether to respect DNT */
  respectDNT?: boolean;

  /** Custom events */
  events?: AnalyticsEvent[];
}

/**
 * Custom analytics event
 */
export interface AnalyticsEvent {
  /** Event name */
  name: string;

  /** Event category */
  category?: string;

  /** Event action */
  action?: string;

  /** Event label */
  label?: string;

  /** Event value */
  value?: number;
}

/**
 * Create analytics plugin
 * @param options - Analytics options
 * @returns Analytics plugin
 */
export function createAnalyticsPlugin(options: AnalyticsOptions): DocsPlugin {
  const {
    provider = "plausible",
    domain,
    apiUrl,
    scriptUrl,
    trackHash = false,
    respectDNT = true,
    events = [],
  } = options;

  // Get script URL based on provider
  const defaultScriptUrls: Record<string, string> = {
    plausible: "https://plausible.io/js/script.js",
    umami: "https://umami.is/script.js",
    fathom: "https://cdn.usefathom.com/script.js",
  };

  const finalScriptUrl = scriptUrl ?? defaultScriptUrls[provider] ?? "";

  return {
    name: "analytics",
    version: "1.0.0",

    onHtmlRender: async (html: string) => {
      // Add analytics script to HTML
      const script = createAnalyticsScript({
        domain,
        apiUrl,
        scriptUrl: finalScriptUrl,
        trackHash,
        respectDNT,
        events,
        provider,
      });

      // Inject before closing body
      return html.replace("</body>", `${script}</body>`);
    },
  };
}

/**
 * Create analytics script
 */
function createAnalyticsScript(options: {
  domain: string;
  apiUrl?: string;
  scriptUrl: string;
  trackHash: boolean;
  respectDNT: boolean;
  events: AnalyticsEvent[];
  provider: string;
}): string {
  const { domain, apiUrl, scriptUrl, trackHash, respectDNT, events, provider } =
    options;

  let extraAttrs = "";
  if (apiUrl && provider === "plausible") {
    extraAttrs += ` data-api="${apiUrl}"`;
  }
  if (trackHash) {
    extraAttrs += ` data-track-hash="true"`;
  }
  if (respectDNT) {
    extraAttrs += ` data-respect-dnt="true"`;
  }

  // Generate custom events code
  const eventCode = events
    .map((event) => {
      return `
  plausible('${event.name}', {
    category: '${event.category ?? ""}',
    action: '${event.action ?? ""}',
    label: '${event.label ?? ""}',
    value: ${event.value ?? 0}
  });`;
    })
    .join("\n");

  return `
<script defer data-domain="${domain}"${extraAttrs} src="${scriptUrl}"></script>
<script>
  window.plausible = window.plausible || function() {
    (window.plausible.q = window.plausible.q || []).push(arguments)
  };
  ${eventCode}
</script>`;
}

// Export plugin instance and factory
export const analyticsPlugin = createAnalyticsPlugin({
  provider: "plausible",
  domain: "",
});
export function analytics(options: AnalyticsOptions): DocsPlugin {
  return createAnalyticsPlugin(options);
}
