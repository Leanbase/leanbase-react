import { LBAPI_ROOT } from './constants';
import { FeatureIdToStatusMap } from './model';

export interface ILBClient {
  hasAccess(featureId: string): boolean;
}

export interface IDeferredLBClient extends ILBClient {
  onReady(readyCb?: (featuresList:string[]) => void):void;
  isReady(): boolean;
}

export class LBNetworkClient implements IDeferredLBClient {
  // Interact with the leanbase API.

  private apiUrl: string;
  private teamId: string;
  private userToken: string;
  private featureMap: FeatureIdToStatusMap = {};
  private isReadyFlag: boolean = false;
  private readyCb?: (featuresList:string[]) => void;

  constructor(teamId: string, userToken: string, apiUrl?:string) {
    if (!userToken) {
      throw Error('LBNetworkClient instances must be created with a userToken');
    }

    this.userToken = userToken;
    this.teamId = teamId;

    if (apiUrl) {
      // If provided, use it otherwise, default to the global url
      this.apiUrl = apiUrl;
    } else {
      this.apiUrl = LBAPI_ROOT;
    }
  }

  isReady() {
    return this.isReadyFlag;
  }

  onReady(readyCb?: (featuresList:string[]) => void) {
    if (this.readyCb) {
      throw Error('Cannot have multiple ready callbacks in LBNetworkClient');
    }

    this.readyCb = readyCb;
  }

  hasAccess(featureId: string):boolean {
    if (this.isReady()) {
      if (this.featureMap.hasOwnProperty(featureId)) {
        return this.featureMap[featureId];
      }

      // Client is ready, but featureId was not found. User implicitly does not
      // have access.
      return false;
    }

    // Client is not ready, we are not ready to respond yet, default to false.
    return false;
  }

  // Make requests to leanbase API and populate internal datastore.
  initialize():void {
    const url = `${this.apiUrl}v1/reply/teams/${this.teamId}/user/features/`;

    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        USER_TOKEN: this.userToken,
      },
    })
    .then((response: FetchUserFeaturesResponse) => {
      return response.json();
    }).then((responseData) => {
      for (const featureId in responseData) {
        this.featureMap[featureId] = responseData[featureId];
      }

      this.isReadyFlag = true;
      this.readyCb && this.readyCb(Object.keys(this.featureMap));
    }).catch((ex) => {
      console.error('parsing failed', ex);
    });
  }
}

interface FetchUserFeaturesResponse extends Response {
  json(): Promise<FeatureIdToStatusMap>;
}

export class LBLocalStorageClient implements ILBClient {
  /**
   * Implements a read-through cache over a networkClient. For the precious few
   * moments before the networkClient is ready, use the previously stored
   * results.
   */
  private networkClient: IDeferredLBClient;

  constructor(networkClient: IDeferredLBClient) {
    this.networkClient = networkClient;
    this.networkClient.onReady((featureIds: string[]) => this.handleNetworkClientReady(featureIds));
  }

  /**
   * If the underlying networkClient is ready, proxy all requests to it. If not,
   * use values stored from the last time if available. Else, default to false.
   *
   * @param featureId feature to get access status for.
   */
  hasAccess(featureId:string) {
    if (this.networkClient.isReady()) {
      const result = this.networkClient.hasAccess(featureId);
      this.put(featureId, result);
      return result;
    }

    // Client is not ready yet, fetch old value if available. Or default.
    const memorizedResult = this.get(featureId);
    if (memorizedResult === null) {
      // Default value. Should figure out what to do about these.
      return false;
    }

    return memorizedResult;
  }

  private handleNetworkClientReady(featureIds: string[]) {
    featureIds.forEach((featureId: string) => {
      this.put(featureId, this.networkClient.hasAccess(featureId));
    });
  }

  private get(featureId: string):boolean|null {
    const storedValue = localStorage.getItem(this.buildFeatureIdKey(featureId));
    if (storedValue === null) {
      // Return null if the values is absent from localstorage
      return null;
    }

    return storedValue === 'true';
  }

  private put(featureId: string, value: boolean) {
    const storedVal = value === true ? 'true' : 'false';
    localStorage.setItem(this.buildFeatureIdKey(featureId), storedVal);
  }

  private buildFeatureIdKey(featureId: string) {
    return `LB-FEATURES-${featureId}`;
  }
}
