import {
  Arg,
  createUnionType,
  Ctx,
  Field,
  FieldResolver,
  ID,
  InputType,
  Mutation,
  ObjectType,
  Query,
  registerEnumType,
  Resolver,
  Root,
  PubSub,
  Subscription,
} from 'type-graphql'
import { PubSubEngine } from 'graphql-subscriptions'
import { Length } from 'class-validator'
import { MyContext } from '~/types/myContext'

// class AddDogSub {
//   @Subscription({
//     topics: ['ADD_DOG'],
//   })
//   addDogSub() {
//     console.log(123)
//     return 'asdasd'
//   }
// }

// enum type
enum DogsType {
  LEFT,
  RIGHT,
}

registerEnumType(DogsType, {
  name: 'DogsType', // this one is mandatory
  description: 'The basic DogsType', // this one is optional
  valuesConfig: {
    LEFT: {
      deprecationReason: 'Replaced with Left or Right',
    },
    RIGHT: {
      description: 'The other left',
    },
  },
})

// @ObjectType({ implements: IPerson })
// class Person implements IPerson {

@ObjectType()
class ErrorMessage {
  @Field()
  message: string

  constructor(message: string) {
    this.message = message
  }
}

@ObjectType()
class Dog {
  @Field((type) => ID)
  id: string

  @Field()
  name: string

  @Field((type) => [DogsType])
  dogsType: DogsType[] = [DogsType.LEFT, DogsType.RIGHT]

  @Field((type) => [Dog])
  childIds: string[]

  constructor(id: string, name: string, childIds: string[] = []) {
    this.id = id
    this.name = name
    this.childIds = childIds
  }
}

const DogUnionError = createUnionType({
  name: 'DogUnionError', // the name of the GraphQL union
  types: () => [Dog, ErrorMessage] as const,
  resolveType: (value) => {
    if ('message' in value) {
      return 'ErrorMessage'
    } else {
      return 'Dog'
    }
  },
})

const dogs: Dog[] = [
  new Dog('1', 'шарик - на цепи'),
  new Dog('2', 'отец шарика', ['1']),
  new Dog('3', 'иваныч'),
]

@ObjectType()
@InputType('InputDataDog')
export class InputDataDog {
  @Field()
  @Length(3, 10)
  name: string
}

@Resolver() //FieldResolver
export class RegisterResolver2 {
  @Query((returns) => DogUnionError)
  asa(): typeof DogUnionError {
    const dog = new Dog('1', 'шарик - на цепи')
    const message = new ErrorMessage('максимальное колличество собак 4')
    return message
  }
}

@Resolver((of) => Dog) //FieldResolver
export class RegisterResolver {
  @Query((returns) => [Dog], {
    name: 'dogs',
    nullable: true,
    description: 'это очень важные данные',
  })
  dogs(): Dog[] {
    return dogs
  }

  @Subscription(() => String, {
    topics: 'ADD_DOG',
    filter: ({ payload, args }) => {
      console.log(payload)
      return true
    },
  })
  loginSub(
    @Root() dogRoot: any
    // @Args() args: NewNotificationsArgs
  ) {
    console.log(123, dogRoot.payload)
    return '111'
  }

  // (of) => [Dog]
  @FieldResolver()
  childIds(@Root() dogRoot: Dog) {
    return dogs.filter((dog) => dogRoot.childIds.includes(dog.id))
  }

  // что-то типа компьютед поля или гетера
  // @FieldResolver((of) => String)
  // async test(@Root() dog: Dog) {
  //   return `${dog.name}`
  // }

  @Mutation(() => DogUnionError)
  addDog(@Arg('data') dog: InputDataDog): typeof DogUnionError {
    // addDog(@Arg('name') name: string) {
    const id = Number(dogs[dogs.length - 1].id) + 1
    if (id >= 5) {
      // throw new Error('максимальное колличество собак 4')

      // const e: any = new Error('Some error')
      // e.extensions = { a: 1, b: 2 } // will be passed in GraphQL-response
      // e.someOtherData = { c: 3, d: 4 } // will be omitted
      // throw e
      return new ErrorMessage('максимальное колличество собак 4')
    } else {
      const payload = { message: `добавлена новая собака ${dog.name}` }
      // await pubSub.publish('ADD_DOG', payload)

      const newDog = new Dog(String(id), dog.name)
      dogs.push(newDog)
      return newDog
    }
  }

  @Mutation(() => String)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() ctx: MyContext,
    @PubSub() pubSub: PubSubEngine
  ): Promise<string> {
    // ctx.res.cookie('some-cookie', 'some-value', {
    //   path: '/',
    //   // httpOnly: true,
    //   sameSite: true,
    //   expires: new Date(Number(new Date())),
    // })
    // ctx.res.header('some-header', 'some-header')
    // console.log(ctx.req.headers)
    await pubSub.publish('ADD_DOG', { payload: { sub: 'привет' } })
    return 'asd'
  }
}
