
export interface FeatureIdToStatusMap {
  [featureId: string]: boolean;
}

export interface ILeanbaseSDKClaims {
  teamId: string;
  user: {
    [userAttribute: string]: any,
  };
}
