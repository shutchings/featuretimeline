import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { PortfolioPlanningMetadata } from "../../Models/PortfolioPlanningQueryModels";

export class PortfolioDirectoryTelemetry {
    public static TrackPageView(plans: PortfolioPlanningMetadata[]) {
        const plansCount = plans ? plans.length : 0;
        AppInsightsTelemetryClient.getClient().trackPageView({
            name: "Directory",
            properties: {
                PlansCount: plansCount
            }
        });
    }
}

export interface AppInsightsConfig {
    instrumentationKey: string;

    /**
     * If true, exceptions are no autocollected. Default is false.
     */
    disableExceptionTracking: boolean;

    /**
     * If true, internal debugging data is thrown as an exception instead of being logged, regardless of SDK logging settings.
     * Default is false.
     *
     * Note: Enabling this setting will result in dropped telemetry whenever an internal error occurs.
     * This can be useful for quickly identifying issues with your configuration or usage of the SDK.
     * If you do not want to lose telemetry while debugging,
     * consider using consoleLoggingLevel or telemetryLoggingLevel instead of enableDebug.
     */
    enableDebug: boolean;

    //  Full config documentation is here:
    //  https://github.com/microsoft/ApplicationInsights-JS
}

export class AppInsightsTelemetryClient {
    private static _instance: AppInsightsTelemetryClient;
    private _insights: ApplicationInsights;

    private constructor() {}

    public static getClient(): ApplicationInsights {
        if (!this._instance) {
            console.log("Creating new AppInsightsTelemetryClient!");
            this._instance = new AppInsightsTelemetryClient();
            this._instance.init(this._instance.getDefaultConfig());
        }

        return this._instance._insights;
    }

    private init(config: AppInsightsConfig) {
        try {
            var webContext = VSS.getWebContext();

            this._insights = new ApplicationInsights({ config: config });
            this._insights.loadAppInsights();
            this._insights.setAuthenticatedUserContext(webContext.user.id, webContext.collection.id);
        } catch (e) {
            console.log(e);
        }
    }

    private getDefaultConfig(): AppInsightsConfig {
        return {
            instrumentationKey: "a91fdcf6-4456-4692-98d3-e390c0b65939",
            disableExceptionTracking: false,
            enableDebug: false
        };
    }
}
