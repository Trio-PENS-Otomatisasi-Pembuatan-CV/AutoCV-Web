interface OrchestratorTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

export class OrchestratorAuthClient {
  private cachedToken: string | null = null;
  private tokenExpiry = 0;

  async getAccessToken(): Promise<string> {
    // Return cached token if valid with 60 seconds buffer
    if (this.cachedToken && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }

    const orchestratorUrl = process.env.UIPATH_ORCHESTRATOR_URL;
    const clientId = process.env.UIPATH_CLIENT_ID;
    const clientSecret = process.env.UIPATH_CLIENT_SECRET;

    if (!orchestratorUrl || !clientId || !clientSecret) {
      throw new Error(
        "Missing Orchestrator credentials (UIPATH_ORCHESTRATOR_URL, UIPATH_CLIENT_ID, UIPATH_CLIENT_SECRET)"
      );
    }

    // Determine identity base URL from orchestrator URL
    // e.g. https://cloud.uipath.com/org/tenant/orchestrator_ -> https://cloud.uipath.com/identity_/connect/token
    let tokenUrl: string;
    try {
      const parsed = new URL(orchestratorUrl);
      tokenUrl = `${parsed.origin}/identity_/connect/token`;
    } catch {
      tokenUrl = "https://cloud.uipath.com/identity_/connect/token";
    }

    const bodyParams = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "OR.Execution OR.Jobs OR.Monitoring",
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Failed to obtain UiPath Orchestrator OAuth token (HTTP ${response.status}): ${errText}`
      );
    }

    const data = (await response.json()) as OrchestratorTokenResponse;
    this.cachedToken = data.access_token;
    // Set expiry 60 seconds before actual expiration
    this.tokenExpiry = Date.now() + Math.max(0, data.expires_in - 60) * 1000;

    return this.cachedToken;
  }

  clearToken(): void {
    this.cachedToken = null;
    this.tokenExpiry = 0;
  }
}

export const orchestratorAuth = new OrchestratorAuthClient();
