import { PubSub } from 'graphql-subscriptions'

const pubsub = new PubSub()

// Объявим классы проблем (ошибок)
class ErrorsCustom {
  private __typename: string = 'ErrorsCustom'
  constructor(private readonly message: string) {
    this.message = message
  }
}

const dog = [
  {
    id: 1,
    name: 'a',
  },
  {
    id: 2,
    name: 'buldog',
  },
]

export const resolvers = {
  Query: {
    helloWorld: () => {
      throw new Error('ошибка')

      const e: any = new Error('Some error')
      e.extensions = { a: 1, b: 2 } // will be passed in GraphQL-response
      e.someOtherData = { c: 3, d: 4 } // will be omitted
      throw e

      // return 'hello world'
    },
    dogs: () => dog,
  },
  Mutation: {
    addDog: async (_, args) => {
      if (args.dog.id >= 5) {
        const error = new ErrorsCustom('Ошибка')
        console.log(error)
        return error
      } else {
        dog.push(args.dog)

        await pubsub.publish('ADD_DOG', {
          addDogSub: dog[dog.length - 1],
        })
        return { ...dog[dog.length - 1], __typename: 'Dog' }
      }
    },
  },
  Subscription: {
    addDogSub: {
      subscribe() {
        return pubsub.asyncIterator(['ADD_DOG'])
      },
    },
  },
}
