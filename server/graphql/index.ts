import * as Koa from 'koa';
import { ApolloServer } from 'apollo-server-koa';
import typeDefs from './schema';
import resolvers from './resolvers';

async function initApolloServer(app: Koa) {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });
  // alternatively you can get a composed middleware from the apollo server
  // app.use(server.getMiddleware());
  const apolloPort = 4000;
  await new Promise((resolve: any) => app.listen({ port: apolloPort }, resolve));
  console.log(`👏🌍Apollo at http://localhost:${apolloPort}${server.graphqlPath}`);
  return { server, app };
}
export default initApolloServer;