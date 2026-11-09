export function validateLiveMode(): void {
  if (process.env.NEXT_PUBLIC_UIPATH_MODE !== "live") return;

  const required = [
    "UIPATH_ORCHESTRATOR_URL",
    "UIPATH_CLIENT_ID",
    "UIPATH_CLIENT_SECRET",
    "UIPATH_TENANT_NAME",
    "UIPATH_FOLDER_ID",
    "UIPATH_PROCESS_KEY_JOB1",
    "UIPATH_PROCESS_KEY_JOB2",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `NEXT_PUBLIC_UIPATH_MODE is set to 'live' but required environment variables are missing: ${missing.join(", ")}`
    );
  }
}
