import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "neuroforge-nexus",
  clientId: "neuroforge-backend",
});

export default keycloak;