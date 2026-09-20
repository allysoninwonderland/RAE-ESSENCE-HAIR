const env = require("./config/env");
const app = require("./app");

app.listen(env.port, () => {
  console.log(`RAE ESSENCE HAIR running at ${env.publicBaseUrl}`);
});
