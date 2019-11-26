# leanbase-react
React client for leanbase's API.

This client integrates with the leanbase API in a very __react__ way.

# Client side SDK

Leanbase's client side SDKs require a little more security than the server side
SDKs. To begin with, there is no API token. The API token is for servers and
provides access to _all_ user's feature access. You would not want that token to
leak out publicly.

Instead, we create a token for a particular user on the server side and pass on
that information to our client which then passes it on to the leanbase API. This
allows the server to pass on the user's attributes to leanbase in a secure way.

Image here?

# Usage

First, you'll need to create the token using your server side SDK. If you are
using the nodejs server sdk, it will be something like this:

## Generate token on the server
```javascript
const user = {
  'email': 'email@address.com',
  'onboarded': true,
  'signedup': '2018-01-02T20:00:12',
  'favorited_channels': ['GlaHquq0', 'AWBf3u90', '0NYf4nhK'],
  ... also, whatever attributes you would like to segment your users on.
};

const userToken = leanbase.configure(apiKey='<API_KEY>').user(user).getUserToken();
```

You must figure out how to transport this to your Typescript application. Should
be simple enough. Perhaps a `window` constant in the markup?

## Configure leanbase on the client

You now need to pass on the userToken to the leanbase client. There are two ways
you could do that.

1. Use a method. Try to do this as early in the app initialisation as possible.

```Typescript
import { configureLeanbase } from leanbase.

...
configureLeanbase(userToken);
```

2. Using a wrapper component.

```TypeScript
import { LBApp } from 'leanbase';

...
  <LBApp userToken={userToken}>
    <ReactRouter>...</ReactRouter>
    ... Your own components.
  </LBApp>
...
```

## Provide alternatives for a feature flag

In the true react way, you can use components to declare alternatives. Say you
have a feature called `post-excerpts`. Users who have access to this feature are
shown an excerpt. Users who don't are shown the dates of the post alone.

This is how you would declare the alternatives.

```TypeScript
import { LBFeature, With, Without } from 'leanbase';

const POST_EXCERPTS_FEATURE_ID = 'NBQUnv';

...
  <LBFeature featureId={POST_EXCERPTS_FEATURE_ID}>
    <With>
      <Excerpt/>
    </With>
    <Without>
      <div>
        {post.date}
      </div>
    </Without>
  </LBFeature>
...
```

# Performance

There are two types of initialisations that might happen on a client. Either the
user-agent has no memory of leanbase, or leanbase has cached details from the
last time. We'll call these **fresh** and **cached** states.

The user can manually remove all data and restore a cached browser to fresh
state. They could also have started using a new browser. We keep it simple,
either localStorage has data, or it doesn't. **fresh** or **cached**.

## Algorithm for fresh state

1. Set up a cached
2. Request user state from leanbase. Block flag evaluations until received or
   timeout.
3. Store user state in cache, if received.
4. Release flag evaluations.

## Algorithm for cached state

1. Request user state from leanbase. Do not block. Flag evaluations, until
   received, are powered by the cache.
2. Update cache state if received from leanbase.

While server side evaluations do not take more than 200ms, this mechanism allows
for variations without compromising _rum: real user metrics_.