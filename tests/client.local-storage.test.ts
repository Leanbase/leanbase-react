import * as sinon from 'sinon';
import { expect } from 'chai';
import { LBLocalStorageClient, IDeferredLBClient } from '../src/client';
import { FeatureIdToStatusMap } from '../src/model';

const sandbox = sinon.createSandbox();
const featureSet:FeatureIdToStatusMap = {
  I: true,
  II: false,
  III: true,
  XI: true,
  XII: false,
  XIII: true,
  MI: false,
  IMI: true,
  IIMI: false,
  XMI: false,
  XIMI: true,
  XIIMI: false,
};

describe('LBLocalStorageClient', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should not call a network client that is not ready yet', () => {
    const hasAccessSpy = sandbox.spy();
    const networkClient:IDeferredLBClient = {
      onReady: () => {},
      isReady: () => false,
      hasAccess: hasAccessSpy,
    };

    const client = new LBLocalStorageClient(networkClient);
    const result = client.hasAccess('FeatureId');

    expect(result).to.equal(false);
    expect(hasAccessSpy.called).to.equal(false);
  });

  it('should call a network client that is ready', () => {
    const hasAccessSpy = sandbox.spy(() => true);
    const networkClient:IDeferredLBClient = {
      onReady: () => {},
      isReady: () => true,
      hasAccess: hasAccessSpy,
    };

    const client = new LBLocalStorageClient(networkClient);
    const result = client.hasAccess('FeatureId');

    expect(result).to.equal(true);
    expect(hasAccessSpy.calledOnce).to.equal(true);
  });

  it('should use the network client hasAccess values if network client is ready', () => {
    const hasAccessSpy = sandbox.spy((fId: string) => featureSet[fId]);

    const networkClient: IDeferredLBClient = {
      onReady: () => {},
      isReady: () => true,
      hasAccess: hasAccessSpy,
    };

    const client = new LBLocalStorageClient(networkClient);
    for (const fId in featureSet) {
      expect(client.hasAccess(fId)).to.equal(featureSet[fId]);
    }

    expect(hasAccessSpy.callCount).to.equal(Object.keys(featureSet).length);
  });

  it('should retain the network client hasAccess values the second time around', () => {
    const hasAccessSpy = sandbox.spy((fId: string) => featureSet[fId]);
    const readyNetworkClient: IDeferredLBClient = {
      onReady: () => {},
      isReady: () => true,
      hasAccess: hasAccessSpy,
    };

    let client = new LBLocalStorageClient(readyNetworkClient);
    for (const fId in featureSet) {
      // Prepping the local storage
      client.hasAccess(fId);
    }

    expect(hasAccessSpy.callCount).to.equal(Object.keys(featureSet).length);

    // Create a second client with a notSoReady network client. The values in
    // local storage should provide the accurate reps.
    const notSoReadyNetworkClient: IDeferredLBClient = {
      onReady: () => {},
      isReady: () => false,
      hasAccess: hasAccessSpy,
    };

    client = new LBLocalStorageClient(notSoReadyNetworkClient);
    for (const fId in featureSet) {
      expect(client.hasAccess(fId)).to.equal(featureSet[fId]);
    }

    // Implies hasAccess on network client is not called after the first check
    expect(hasAccessSpy.callCount).to.equal(Object.keys(featureSet).length);
  });
});
