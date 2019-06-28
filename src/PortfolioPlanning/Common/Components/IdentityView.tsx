import * as React from "react";
import "./IdentityView.scss";
import { VssPersona, VssPersonaSize } from "azure-devops-ui/VssPersona";
import { isIdentityRef, parseUniquefiedIdentityName } from "../Utilities/Identity";
import { css } from "azure-devops-ui/Util";
import { IdentityRef } from "VSS/WebApi/Contracts";

export interface IIdentityViewProps {
    className?: string;
    value: IdentityRef | string;
    size?: VssPersonaSize;
}

export const IdentityView = (props: IIdentityViewProps): JSX.Element => {
    const { value } = props;
    let identityRef: IdentityRef;

    if (!isIdentityRef(value)) {
        identityRef = parseUniquefiedIdentityName(value);
    } else {
        identityRef = value;
    }

    if (!identityRef || !identityRef.displayName) {
        return null;
    }

    return (
        <VssPersona
            className={css("identity-view", props.className)}
            size={props.size || "medium"}
            identityDetailsProvider={{
                getDisplayName: () => identityRef.displayName,
                getIdentityImageUrl: () => identityRef.imageUrl
            }}
        />
    );
};
