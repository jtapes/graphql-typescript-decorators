import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  type ErrorsCustom {
    message: String!
  }

  type Query {
    helloWorld: String!
    dogs: [Dog!]!
  }

  type Dog {
    id: ID!
    name: String!
  }

  union DogType = Dog | ErrorsCustom

  input Command {
    id: ID
    name: String
  }
  type Mutation {
    addDog(dog: Command): DogType!
  }

  type Subscription {
    addDogSub: Dog!
  }
`
