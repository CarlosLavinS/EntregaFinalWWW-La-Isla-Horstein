import { startCatalogServers } from "./server.js";

startCatalogServers().catch((error) => {
  console.error(error);
  process.exit(1);
});
