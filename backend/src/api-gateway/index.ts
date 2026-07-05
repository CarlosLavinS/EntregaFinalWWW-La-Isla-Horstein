import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { config } from "../shared/config.js";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./schema.js";

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const { url } = await startStandaloneServer(server, {
  listen: { port: config.gatewayPort }
});

console.log(`api-gateway GraphQL ${url}`);
