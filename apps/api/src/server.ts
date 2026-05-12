import { app } from "./app.js";
import { env } from "./lib/env.js";

app.listen(env.API_PORT, () => {
  console.log(`Expectations API listening on ${env.API_PORT}`);
});
