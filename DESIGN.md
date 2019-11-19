# Design of client side SDKs

Client side SDK should be initialized for a single user. During the init
process, the latest status information is fetched, processed and an in-memory
object provides access to feature on/off status.

Unlike server-side SDKs, refetching or refreshing the information is not done
automatically. If features states are switched while a client is active, the
entire application might need re-rendering and the user's workflow state might
be lost.

# Data transferred

At construction, a server-side SDK provides the client constructor with a token.
This token is generated on the server. It is a JWT with user attributes as the
claims. It is signed using a key provided in the leanbase console.

At initialisation, the client requests the leanbase API for a status map for the
current user. The server takes all active features, computes whether this user
would have access and returns a 'featureId' -> on/off map.

# Security

The API key or the signing key is never made available to the client. These are
only available to the server. The leanbase API verifies the JWT signature and 
only returns data IFF the signature is valid.

This ensures that a user does not have access to another user's features. It
also ensures that private credentials do not leak out.

# Performance

To ensure the checks are performed as early as possible during page load, the
call to leanbase's API should be made in the <HEAD> section.