import * as React from 'react';

import { getClient } from './configure';

interface ILBFeatureContextProps {
  featureId: string;
  on: boolean;
}

const LBFeatureContext:React.Context<ILBFeatureContextProps> = React.createContext<ILBFeatureContextProps>({
  featureId: '',
  on: false,
});

abstract class Variant extends React.Component {
  /**
   * Sub-classes should provide their own shouldRender method based on their own
   * intent to render given an LBFeature context.
   */
  abstract shouldRender(context: ILBFeatureContextProps):boolean;

  render() {
    return (
      <LBFeatureContext.Consumer>
        {(context: ILBFeatureContextProps):React.ReactNode => {
          if (context.featureId === '' || context.featureId === null || context.featureId === undefined) {
            throw Error('<With>/<Without> should not be used outside of an <LBFeature>.');
          }

          if (this.shouldRender(context)) {
            return this.props.children;
          } else {
            return null;
          }
        }}
      </LBFeatureContext.Consumer>
    )
  }
}

export class With extends Variant {
  shouldRender(context: ILBFeatureContextProps) {
    return context.on;
  }
}

export class Without extends Variant {
  shouldRender(context: ILBFeatureContextProps) {
    return !context.on;
  }
}

interface ILBFeatureProps {
  featureId: string;
}

interface ILBFeatureState {
  ready: boolean;
  on: boolean;
}

export class LBFeature extends React.Component<ILBFeatureProps, ILBFeatureState> {
  constructor(props:ILBFeatureProps) {
    super(props);

    if (props.featureId === undefined) {
      throw Error("<LBFeature> must have a featureId attribute.");
    }

    this.state = {
      ready: false,
      on: false,
    };
  }

  /**
   * Within cDM, we will query the leanbase client and update the state
   * accordingly.
   */
  componentDidMount() {
    var result = getClient().hasAccess(this.props.featureId);
    this.setState({ on: result });
  }

  render() {
    return (
      <LBFeatureContext.Provider value={{ 
          featureId: this.props.featureId, 
          on: this.state.on
        }}>
        {this.props.children}
      </LBFeatureContext.Provider>
    );
  }
}
