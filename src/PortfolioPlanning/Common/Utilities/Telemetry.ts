import * as tc from "telemetryclient-team-services-extension";

export function getTelemetryClient(): tc.TelemetryClient {
    return tc.TelemetryClient.getClient(getTelemetrySettings());
}

function getTelemetrySettings(): tc.TelemetryClientSettings {
    return {
        key: "80adb7f5-4331-4641-8d36-f7f8694a8379",
        extensioncontext: "portfolioplans",
        disableTelemetry: "false",
        disableAjaxTracking: "false",
        enableDebug: "true"
    };
}
