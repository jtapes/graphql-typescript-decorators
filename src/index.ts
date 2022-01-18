import 'reflect-metadata'
import { createServer } from 'http'
import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { RegisterResolver, RegisterResolver2 } from './resolver'
import { buildSchema } from 'type-graphql'
// import { makeExecutableSchema } from '@graphql-tools/schema'
// import { resolvers } from './doc/resolver'
// import { typeDefs } from './doc/typeDefs'
;(async function () {
  const app = express()

  const httpServer = createServer(app)

  const schema = await buildSchema({
    resolvers: [RegisterResolver, RegisterResolver2],
    validate: (argValue) => {
      // console.log(111, argValue)
      // if (error) {
      //   // throw error on failed validation
      //   throw error
      // }
    },
  })

  // const schema = makeExecutableSchema({
  //   TestSchema,
  //   resolvers,
  // })

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    { server: httpServer, path: '/graphql' }
  )

  const server = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close()
            },
          }
        },
      },
    ],
    context: ({ req, res }) => {
      const context = {
        req,
        res,
      }
      return context
    },
  })
  await server.start()
  server.applyMiddleware({ app })

  const PORT = 4000
  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}/graphql`)
  )
})()
