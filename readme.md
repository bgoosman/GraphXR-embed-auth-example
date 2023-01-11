# OIDC Session Handoff to GraphXR running in an iframe

## How it works:

- Third Party initiates OIDC login
- Keycloak hands back access token for User to Third Party
- Third Party leaks User's access token to GraphXR via iframe url query param `token` and identity via `email`
  - `<iframe src="http://graphxr/projects?token={user's access token}&email={user's email}" width="100%" height="500px"></iframe>`
- GraphXR verifies access token with Keycloak
- If successful, user is now logged into GraphXR

## Quickstart

### 1. Configure your OIDC client on Keycloak

Note: change values to meet your installation. You probably already have an OIDC client configured, in which case most of these values will already be configured.

1a. Create `OpenID Connect Client`

- id: `Third Party App`
- Enable `Client authentication`
- Enable `Service accounts roles`

1b. On `Client details` page

Note: you probably only have to configure GraphXR under "Web origins", since if you already had an OIDC client configured, then it's likely you already configured these. These URLs prep you to try out the example app in this repository.

- Root URL: `http://localhost:$EXAMPLE_APP_PORT`
- Home URL: `http://localhost:$EXAMPLE_APP_PORT/oauth2/login`
- Valid redirect URIs: `http://localhost:$EXAMPLE_APP_PORT/*`
- Valid post logout redirect URIs: `http://localhost:$EXAMPLE_APP_PORT/oauth2/logout`
- Web origins:
  - Third party: `http://localhost:$EXAMPLE_APP_PORT`
  - [This is the key part] GraphXR: `http://localhost:9000`

1c. On `Client scopes` page, make sure there is a client scope with the `view-profile` role

- Create client scope
  - Name: openid
  - Type: Default
  - On `Scope` tab of `openid` client scope
    - Click `Assign role`, filter by clients
    - Add `view-profile` role to openid
    - May have to add this scope to your OIDC client

### 2. Configure GraphXR

GraphXR's config.js, set userProfileURL and profileMapping:

```javascript
iframeAuth: {
  // This is the URL param to pass the oAuthToken to GraphXR
  keyName: "token",

  // Keycloak info below:
  userProfileURL: "http://localhost:8080/realms/master/protocol/openid-connect/userinfo",
  profileMapping: {
    email: "email", // this sets the GraphXR username
    firstName: "family_name", // you may want to change this to the email
    lastName: "given_name", // this is optional
  },
},
```

Also set cors in config.js:

```javascript
cors: {
  origin: "*", // default "*". "*" : allow all origin
  referrerPolicy: { policy: "unsafe-url" },
  frameguard: false,  //default true, default the share page allow iframe embed. false : allow all graphXR embed.
  contentSecurityPolicy: false,
},
```

### 3. [optional] Try out this example app

```shell
# Setup Keycloak
set -e
TAG=example
KEYCLOAK_DOCKER_IMAGE=quay.io/keycloak/keycloak:19.0.3
KEYCLOAK_DOCKER_NAME=${TAG}_keycloak
KEYCLOAK_DOCKER_DATA=${TAG}_keycloak_data

if [ ! "$(docker ps -a | grep $KEYCLOAK_DOCKER_NAME)" ]; then
docker rm -f ${KEYCLOAK_DOCKER_NAME}
docker run -it \
  --name ${KEYCLOAK_DOCKER_NAME} \
  -p 8080:8080 \
  -d \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  --volume ${KEYCLOAK_DOCKER_DATA}:/opt/keycloak/data \
  $KEYCLOAK_DOCKER_IMAGE start-dev
fi
```

Login with admin credentials at http://localhost:8080/admin/master/console/#/master/users

```
user: admin
pass: admin
```

Create user

```
user: demo@kineviz.com
pass: demo
email: demo@kineviz.com
email verified: yes
```

- Configure `app/config/config.json`

  - with urls from http://localhost:8080/realms/master/.well-known/openid-configuration
  - with Keycloak Client ID and Client Secret, callbackURL, logoutCallbackURL

- Configure GraphXR URL in iframe (see dashboard.hbs)
  - `<iframe src="http://localhost:9000/projects?token={{oAuthToken}}&email={{email}}" width="100%" height="500px"></iframe>`

```shell
# Run the example app
yarn install
yarn start
```
