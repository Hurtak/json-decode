import test from 'ava'
import _ from 'lodash'

import jd from './index.js'

function decodingShouldSucceed (t, result, value) {
  if (arguments.length !== 3) throw new Error('Wrong number of arguments.')

  t.deepEqual(result, {
    error: null,
    data: value
  })
}

function decodingShouldError (t, result) {
  if (arguments.length !== 2) throw new Error('Wrong number of arguments.')

  t.deepEqual(_.size(result), 2)
  t.deepEqual(result.data, null)
  t.deepEqual(_.isObject(result.error), true)

  t.deepEqual(_.size(result.error), 3)
  t.deepEqual(typeof result.error.message, 'string')
  t.deepEqual(typeof result.error.path, 'string')
  t.deepEqual(typeof result.error.code, 'number')
}

// Basic data types

const dataTypes = {
  null: [ // type
    [jd.null, null] // [decoder, value]
  ],

  boolean: [
    [jd.boolean, true],
    [jd.boolean, false]
  ],

  number: [
    [jd.number, 0],
    [jd.number, 1],
    [jd.number, -1],

    [jd.number, 10e5],
    [jd.number, 10e10],
    [jd.number, 10e15],

    [jd.number, 10e-5],
    [jd.number, 10e-10],
    [jd.number, 10e-15],

    [jd.number, 123456789],
    [jd.number, -123456789],
    [jd.number, 0.123456789],
    [jd.number, -0.123456789],

    [jd.number, Number.MAX_SAFE_INTEGER],
    [jd.number, Number.MIN_SAFE_INTEGER]
  ],

  string: [
    [jd.string, ''],

    [jd.string, 'hello world'],

    [jd.string, '你好，世界'],
    [jd.string, 'สวัสดีชาวโลก'],
    [jd.string, 'नमस्कार संसार'],
    [jd.string, 'مرحبا بالعالم'],
    [jd.string, 'Բարեւ աշխարհ'],
    [jd.string, 'Chào thế giới'],

    [jd.string, '0123456789'.repeat(10)],
    [jd.string, '0123456789'.repeat(1000)]
  ],

  array: [
    [jd.array(jd.null), [null]],
    [jd.array(jd.boolean), [true, false]],
    [jd.array(jd.number), [0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]],
    [jd.array(jd.string), ['', 'hello there']],

    [jd.array(jd.object({ null: jd.null })), [{ null: null }]],
    [jd.array(jd.object({ boolean: jd.boolean })), [{ boolean: true }]],
    [jd.array(jd.object({ number: jd.number })), [{ number: 1 }]],
    [jd.array(jd.object({ string: jd.string })), [{ string: 'hello there' }]]
  ],

  object: [
    [jd.object({ null: jd.null }), { null: null }],
    [jd.object({ boolean: jd.boolean }), { boolean: true }],
    [jd.object({ number: jd.number }), { number: 1 }],
    [jd.object({ string: jd.string }), { string: 'hello there' }],

    [jd.object({ string: jd.array(jd.null) }), { string: [null] }],
    [jd.object({ string: jd.array(jd.boolean) }), { string: [true, false] }],
    [jd.object({ string: jd.array(jd.number) }), { string: [0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER] }],
    [jd.object({ string: jd.array(jd.string) }), { string: ['hello there'] }]
  ]
}

// Test if each type decodes correctly against its decoder and that it
// errors when the value of type is decoded with decoder of other type.
test('Types matrix', t => {
  for (const keyType in dataTypes) {
    const type = dataTypes[keyType]

    for (const [decoder, value] of type) {
      // decoder should correctly decode value
      decodingShouldSucceed(t, jd(value, decoder), value)

      for (const keyTypeAgain in dataTypes) {
        if (keyTypeAgain === keyType) continue

        const typeOther = dataTypes[keyTypeAgain]
        for (const [decoderOther, valueOther] of typeOther) {
          // decoder should not decode agains values from other data types
          decodingShouldError(t, jd(valueOther, decoder))

          // value should not decode agains decoders from other types
          decodingShouldError(t, jd(value, decoderOther))
        }
      }
    }
  }
})

test('Object', t => {
  let decoder, value

  // basic check
  decoder = jd.object({
    null: jd.null,
    boolean: jd.boolean,
    number: jd.number,
    string: jd.string
  })
  value = {
    null: null,
    boolean: true,
    number: 1,
    string: 'hello'
  }
  decodingShouldSucceed(t, jd(value, decoder), value)

  // wrong type of property should error
  decoder = jd.object({ number: jd.number })
  value = { number: '1' }
  decodingShouldError(t, jd(value, decoder))

  // additional property should be ok
  decoder = jd.object({ a: jd.number })
  value = { a: 1, b: 1 }
  decodingShouldSucceed(t, jd(value, decoder), value)

  // missing property should error
  decoder = jd.object({ a: jd.number, b: jd.number })
  value = { a: 1 }
  decodingShouldError(t, jd(value, decoder))
})

test('Nested types', t => {
  let decoder, value

  // Arrays
  decoder = jd.array(jd.array(jd.number))

  value = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
  decodingShouldSucceed(t, jd(value, decoder), value)
  value = [[]]
  decodingShouldSucceed(t, jd(value, decoder), value)
  value = []
  decodingShouldSucceed(t, jd(value, decoder), value)
  value = undefined
  decodingShouldError(t, jd(value, decoder))
  value = [[1, 2, 3], [4, '5', 6], [7, 8, 9]]
  decodingShouldError(t, jd(value, decoder))

  decoder = jd.array(jd.array(jd.array(jd.number)))

  value = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
  decodingShouldSucceed(t, jd(value, decoder), value)
  value = [[[1, 2], [3, 4]], [['5', 6], [7, 8]]]
  decodingShouldError(t, jd(value, decoder))

  decoder = jd.array(jd.array(jd.object({ x: jd.number })))

  value = [[{ x: 1 }, { x: 2 }], [{ x: 3 }, { x: 4 }]]
  decodingShouldSucceed(t, jd(value, decoder), value)
  value = [[{ x: 1 }, { x: 2 }], [{ x: true }, { x: 4 }]]
  decodingShouldError(t, jd(value, decoder))
  value = [[{ x: 1 }, { x: 2 }], [{}, { x: 4 }]]
  decodingShouldError(t, jd(value, decoder))

  decoder = jd.array(jd.object({ x: jd.array(jd.number) }))

  value = [{ x: [1, 2, 3] }]
  decodingShouldSucceed(t, jd(value, decoder), value)
  value = [{ x: [1, '2', 3] }]
  decodingShouldError(t, jd(value, decoder))
  value = [{}]
  decodingShouldError(t, jd(value, decoder))

  // Objects
  decoder = jd.object({ object: jd.array(jd.array(jd.number)) })

  value = { object: [[1, 2], [3, 4], [5, 6]] }
  decodingShouldSucceed(t, jd(value, decoder), value)
  value = { object: [[1, 2], [3, {'4': 4}], [5, 6]] }
  decodingShouldError(t, jd(value, decoder))

  decoder = jd.object({ object: jd.array(jd.object({ x: jd.number })) })

  value = { object: [{ x: 0 }, { x: 1 }, { x: 2 }] }
  decodingShouldSucceed(t, jd(value, decoder), value)
  value = { object: [{ x: 0 }, {}, { x: 2 }] }
  decodingShouldError(t, jd(value, decoder))

  decoder = jd.object({ object: jd.object({ x: jd.object({ y: jd.number }) }) })

  value = { object: { x: { y: 1 } } }
  decodingShouldSucceed(t, jd(value, decoder), value)
  value = { object: { x: { y: null } } }
  decodingShouldError(t, jd(value, decoder))

  decoder = jd.object({ object: jd.object({ x: jd.array(jd.number) }) })

  value = { object: { x: [1, 2, 3] } }
  decodingShouldSucceed(t, jd(value, decoder), value)
  value = { object: { x: [1, null, 3] } }
  decodingShouldError(t, jd(value, decoder))
})

test('Shared type objects', t => {
  // define type
  const UserData = jd.object({
    username: jd.string,
    email: jd.string
  })

  // extend it
  const UserDataExtended = Object.assign({},
    UserData,
    { salary: jd.number }
  )

  const decoderOriginal = jd.object({
    userInfo: UserDataExtended,
    employer: UserData,
    employees: jd.array(UserDataExtended)
  })
  const valueOriginal = {
    userInfo: { username: 'Tom', email: 'tom@gmail.com', salary: 100000 },
    employer: { username: 'Anna', email: 'anna@gmail.com' },
    employees: [
      { username: 'Peter', email: 'tom@gmail.com', salary: 50000 },
      { username: 'Nina', email: 'tom@gmail.com', salary: 50000 }
    ]
  }
  decodingShouldSucceed(t, jd(valueOriginal, decoderOriginal), valueOriginal)

  let value

  value = _.cloneDeep(valueOriginal)
  value.employees[1].email = null
  decodingShouldError(t, jd(value, decoderOriginal))

  value = _.cloneDeep(valueOriginal)
  delete value.employer.username
  decodingShouldError(t, jd(value, decoderOriginal))
})

test.skip('Error codes', t => {
  let decoder, value, result

  // 100 - type of value does match the decoder type
  decoder = Number
  value = false
  result = jd(value, decoder)
  decodingShouldError(t, result)
  t.deepEqual(result.error.code, 100)

  // 200 - missing type in array decoder
  decoder = []
  value = []
  result = jd(value, decoder)
  decodingShouldError(t, result)
  t.deepEqual(result.error.code, 200)

  // 300 - more than one type specified in array decoder
  decoder = [Number, String]
  value = []
  result = jd(value, decoder)
  decodingShouldError(t, result)
  t.deepEqual(result.error.code, 300)

  // 400 - missing key in object decoder
  decoder = {}
  value = {}
  result = jd(value, decoder)
  decodingShouldError(t, result)
  t.deepEqual(result.error.code, 400)

  // 500 - key specified in decoder is missing from decoded object
  decoder = { key: Number }
  value = {}
  result = jd(value, decoder)
  decodingShouldError(t, result)
  t.deepEqual(result.error.code, 500)

  // 600 - unknown decoder type
  const invalidDecoders = [
    undefined, true, false, 0, 1, '', '1',
    Array, Object, Function,
    function () {}, () => {},
    // eslint-disable-next-line no-new-wrappers, no-new-func
    new Boolean(), new String(), new Number(), new Function()
  ]
  for (const invalidDecoder of invalidDecoders) {
    result = jd(null, invalidDecoder)
    decodingShouldError(t, result)
    t.deepEqual(result.error.code, 600)
  }
})

test.skip('Error codes', t => {
  let decoder, value, result

  // basic type
  decoder = Number
  value = false
  result = jd(value, decoder)
  decodingShouldError(t, result)
  t.deepEqual(result.error.path, '<data>')

  // arrays
  decoder = [Number]
  value = [0, 1, '2', 3]
  result = jd(value, decoder)
  decodingShouldError(t, result)
  t.deepEqual(result.error.path, '<data>[2]')

  decoder = [[Number]]
  value = [[0], [1], [2, '1'], [3]]
  result = jd(value, decoder)
  decodingShouldError(t, result)
  t.deepEqual(result.error.path, '<data>[2][1]')

  // objects
  decoder = {a: Number}
  value = {a: '1'}
  result = jd(value, decoder)
  decodingShouldError(t, result)
  t.deepEqual(result.error.path, '<data>.a')

  decoder = {a: Number, b: {bb: Number}, c: Number}
  value = {a: 1, b: {bb: '1'}, c: 1}
  result = jd(value, decoder)
  decodingShouldError(t, result)
  t.deepEqual(result.error.path, '<data>.b.bb')

  // combined
  decoder = {a: Number, b: [{ aa: Number, bb: [Number] }], c: Number}
  value = {a: 1, b: [{aa: 1, bb: [0, 1]}, {aa: 1, bb: [0, '1', 2]}], c: 1}
  result = jd(value, decoder)
  decodingShouldError(t, result)
  t.deepEqual(result.error.path, '<data>.b[1].bb[1]')
})

test.skip('Number of arguments', t => {
  // Test on `undefined` to make sure we are really checking number of arguments
  // and not their values (which would be undefined if user did not pass them).

  for (let argsNumber = 0; argsNumber <= 10; argsNumber++) {
    const args = new Array(argsNumber).fill(undefined)
    if (argsNumber === 2) {
      t.notThrows(() => jd(...args))
    } else {
      t.throws(() => jd(...args))
    }
  }
})

test.skip('Decoder with configuration', t => {
  let decoder, value

  // no config
  decoder = Number
  value = 0
  decodingShouldSucceed(t, jd(value, decoder), value)

  // with config
  decoder = { $type: Number }
  value = 0
  decodingShouldSucceed(t, jd(value, decoder), value)

  // with config + invalid decoder
  decoder = { $type: undefined }
  value = 0
  decodingShouldError(t, jd(value, decoder))


  // t.deepEqual(jd('abc', { type: String }), 'abc')
  // t.deepEqual(jd([1], { type: [Number] }), [1])
  // t.deepEqual(jd({ a: 1 }, { type: { a: Number } }), { a: 1 })
})

test.skip('Optional', t => {
  // t.deepEqual(jd({a: 1}, { a: Number }), { a: 1 })
  // t.deepEqual(jd({a: 1}, { a: { type: Number, default: 0 } }), { a: 1 })
  // t.deepEqual(jd({}, { a: { type: Number, default: 0 } }), { a: 0 })
})

test.skip('unknown decoder type', t => {
  // TODO: throws but in wrong brach
  // t.throws(() => jd(undefined, undefined))
  // t.throws(() => jd(0, 0))
  // t.throws(() => jd(true, true))

  // const f = () => true
  // t.throws(() => jd(f, f))

  // const f2 = Function
  // t.throws(() => jd(f2, f2))

  // const nan = NaN
  // t.throws(() => jd(nan, nan))
})

/*

  // validation
  jd.decode(data, { type: Number, default: 0, validation: x => x >= 200 && x < 300 })

  // union types
  jd.decode(data2, {
    normal: Number,

    unionType: { unionType: [String, [String]] },
    unionTypeOptional: { unionType: [String, [String]], default: [] },

    object: { hello: String },

    objectOptional: {
      type: { hello: String },
      default: {}
    },

    // or more like this?
    objectOptional: {
      type: Object,
      default: {},
      children: { hello: String },
    },

    objectUnionTypeOptional: {
      unionType: [
        { hello: String },
        { hola: String }
      ],
      default: { hello: 'there' }
    }
  })

  // type definitions
  const user = {
    username: String
  }

  const admin = {
    username: String,
    rights: [String]
  }

  jd.decode(data, {
    unionType: [user, admin]
  })

  // validation functions
  jd.decode(data, {
    type: String,
    validation: x => x.length > 0
  })

*/
