import { startUserServers } from "./server.js";

startUserServers().catch((error) => {
  console.error(error);
  process.exit(1);
});
