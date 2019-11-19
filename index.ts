const LBAPI_ROOT = "https://api.leanbase.io/";

class LBClient {
  // Interact with the leanbase API.

  private apiUrl: string;
  private userApiToken: string;
  
  constructor(userApiToken: string, apiUrl?:string) {
    if (!userApiToken) {
      throw Error("LBClient instances must be created with a userAPIToken");
    }

    this.userApiToken = userApiToken;

    if (apiUrl) {
      // If provided, use it otherwise, default to the global url
      this.apiUrl = apiUrl;
    } else {
      this.apiUrl = LBAPI_ROOT; 
    }
  }

  getUserFeatureMap():LBUser {
    return new LBUser(id);
  }
}

class LBUser {
  // An abstract entity that allows querying for access to feature status for a
  // user.

  private id: string;

  constructor(id:string) {
    this.id = id;
  }

  hasAccess(featureId: string):boolean {
    return false;
  }
}