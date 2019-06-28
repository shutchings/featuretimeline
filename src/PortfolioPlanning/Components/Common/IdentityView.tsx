import * as React from "react";
import "./IdentityView.scss";
import { VssPersona, VssPersonaSize } from "azure-devops-ui/VssPersona";
import { css } from "azure-devops-ui/Util";
import { IdentityRef } from "VSS/WebApi/Contracts";

export interface IIdentityViewProps {
    className?: string;
    identityRef: IdentityRef;
    size?: VssPersonaSize;
}

export const IdentityView: React.StatelessComponent<IIdentityViewProps> = (props: IIdentityViewProps): JSX.Element => {
    if (!props.identityRef || !props.identityRef.displayName) {
        return null;
    }

    return (
        <VssPersona
            className={css("identity-view", props.className)}
            size={props.size || "medium"}
            identityDetailsProvider={{
                getDisplayName: () => props.identityRef.displayName,
                getIdentityImageUrl: () => props.identityRef.imageUrl
            }}
        />
    );
};
