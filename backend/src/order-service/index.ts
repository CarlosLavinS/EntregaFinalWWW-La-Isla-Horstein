import { startOrderServers } from "./server.js";

startOrderServers().catch((error) => {
  console.error(error);
  process.exit(1);
});
