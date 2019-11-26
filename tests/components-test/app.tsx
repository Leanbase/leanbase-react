import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { configureLeanbase, LBFeature, With, Without } from '../../';

const userToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0ZWFtSWQiOiJOQnlRUGdhIiwidXNlciI6eyJlbWFpbCI6ImRpcGFuamFuLm11QGxlYW5iYXNlLmlvIn19.BbGecnX6_3XlcviwzsC8qds5vrKfFogBEJOCr4zwDaU';
const testFeatureIds = [
  "3Vg5Qg8",
  "5RnzKga",
  "NByQPga",
  "aQLMDyN",
  "djL05np",
  "mWnkGnv",
  "oBLPmn3",
  "plgYqgG",
  "qGyN3Lo",
];

interface IAppProps {
  userToken: string;
}

export class App extends React.Component<IAppProps> {
  constructor(props:IAppProps) {
    super(props);
    configureLeanbase(props.userToken);
  }

  render() {
    return [
      <h1>Testing out a few features here.</h1>,
      <p>Check it out</p>,
      ...testFeatureIds.map((fId) => {
        return <LBFeature featureId={fId}>
          <div>Feature: <span style={{ fontFamily: 'monospace' }}>{fId}</span>
            <With>
              <span className="bullet green"></span>
            </With>
            <Without>
              <span className="bullet red"></span>
            </Without>
          </div>
        </LBFeature>
      })
    ]
  }
}



ReactDOM.render(<App userToken={userToken}/>, document.getElementById('app-mount-root'));
