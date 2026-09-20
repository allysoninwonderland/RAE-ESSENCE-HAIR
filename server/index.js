const env = require("./config/env");
const app = require("./app");

app.listen(env.port, () => {
  console.log(`RAE ESSENCE LUXE running at ${env.publicBaseUrl}`);
});
