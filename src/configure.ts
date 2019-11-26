import * as jwtDecode from 'jwt-decode';

import { LBNetworkClient, LBLocalStorageClient, ILBClient } from './client';
import { ILeanbaseSDKClaims } from './model';

/**
 * All server SDKs provide the team id as part of the claims. The claims are in
 * the following shape: ILeanbaseSDKClaims
 *
 * {
 *  "user": {
 *    ... attributes
 *  },
 *  "teamId": "<teamId>"
 * }
 */

function extractTeamId(userToken:string):string {
  const decoded = jwtDecode<ILeanbaseSDKClaims>(userToken);
  return decoded['teamId'];
}

let client: ILBClient|null = null;
export function getClient():ILBClient {
  if (client === null) {
    throw Error('Leanbase Client should be configured before user');
  }

  return client;
}

export function configureLeanbase(userToken:string) {
  const networkClient = new LBNetworkClient(
    extractTeamId(userToken),
    userToken,
  );
  networkClient.initialize();
  
  client = new LBLocalStorageClient(networkClient);
}
