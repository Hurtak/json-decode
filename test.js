import test from 'ava'
import _ from 'lodash'

import jd from './index.js'

// Basic data types

const dataTypes = {
  null: [ // type
    [null, null] // [typeDecoder, typeValue]
  ],

  boolean: [
    [Boolean, true],
    [Boolean, false]
  ],

  number: [
    [Number, 0],
    [Number, 1],
    [Number, -1],

    [Number, 10e5],
    [Number, 10e10],
    [Number, 10e15],

    [Number, 10e-5],
    [Number, 10e-10],
    [Number, 10e-15],

    [Number, 123456789],
    [Number, -123456789],
    [Number, 0.123456789],
    [Number, -0.123456789],

    [Number, Number.MAX_SAFE_INTEGER],
    [Number, Number.MIN_SAFE_INTEGER]
  ],

  string: [
    [String, ''],

    [String, 'hello world'],

    [String, '你好，世界'],
    [String, 'สวัสดีชาวโลก'],
    [String, 'नमस्कार संसार'],
    [String, 'مرحبا بالعالم'],
    [String, 'Բարեւ աշխարհ'],
    [String, 'Chào thế giới'],

    [String, '0123456789'.repeat(10)],
    [String, '0123456789'.repeat(1000)]
  ],

  array: [
    [[null], [null]],
    [[Boolean], [true, false]],
    [[Number], [0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]],
    [[String], ['', 'hello there']],

    [[{ null: null }], [{ null: null }]],
    [[{ boolean: Boolean }], [{ boolean: true }]],
    [[{ number: Number }], [{ number: 1 }]],
    [[{ string: String }], [{ string: 'hello there' }]]
  ],

  object: [
    [{ null: null }, { null: null }],
    [{ boolean: Boolean }, { boolean: true }],
    [{ number: Number }, { number: 1 }],
    [{ string: String }, { string: 'hello there' }],

    [{ string: [null] }, { string: [null] }],
    [{ string: [Boolean] }, { string: [true, false] }],
    [{ string: [Number] }, { string: [0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER] }],
    [{ string: [String] }, { string: ['hello there'] }]
  ]
}

// Test if each type decodes correctly against its decoder and that it
// errors when the value of type is decoded with decoder of other type.
test.only('Types matrix', t => {
  for (const keyType in dataTypes) {
    const type = dataTypes[keyType]

    for (const [decoder, value] of type) {
      // decoder should correctly decode value
      t.deepEqual(jd(value, decoder), {
        error: null,
        data: value
      })

      for (const keyTypeAgain in dataTypes) {
        if (keyTypeAgain === keyType) continue

        const typeOther = dataTypes[keyTypeAgain]
        for (const [decoderOther, valueOther] of typeOther) {
          // decoder should not decode agains values from other data types
          let res
          res = jd(valueOther, decoder)
          t.deepEqual(typeof res.error, 'string')
          t.deepEqual(res.data, valueOther)
          t.deepEqual(_.size(res), 2)

          // value should not decode agains decoders from other types
          res = jd(value, decoderOther)
          t.deepEqual(typeof res.error, 'string')
          t.deepEqual(res.data, value)
          t.deepEqual(_.size(res), 2)
        }
      }
    }
  }
})

test('Object', t => {
  let decoder, value

  decoder = {
    null: null,
    boolean: Boolean,
    number: Number,
    string: String
  }
  value = {
    null: null,
    boolean: true,
    number: 1,
    string: 'hello'
  }
  t.deepEqual(jd(value, decoder), value)
})

test('Nested types', t => {
  let decoder, value

  // Arrays
  decoder = [[Number]]
  value = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
  t.deepEqual(jd(value, decoder), value)

  decoder = [[[Number]]]
  value = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
  t.deepEqual(jd(value, decoder), value)

  decoder = [[{ x: Number }]]
  value = [[{ x: 1 }, { x: 2 }], [{ x: 3 }, { x: 4 }]]
  t.deepEqual(jd(value, decoder), value)

  decoder = [{ x: [Number] }]
  value = [{ x: [1, 2, 3] }]
  t.deepEqual(jd(value, decoder), value)

  // Objects
  decoder = { object: [[Number]] }
  value = { object: [[1, 2], [3, 4], [5, 6]] }
  t.deepEqual(jd(value, decoder), value)

  decoder = { object: [{ x: Number }] }
  value = { object: [{ x: 0 }, { x: 1 }, { x: 2 }] }
  t.deepEqual(jd(value, decoder), value)

  decoder = { object: { x: { y: Number } } }
  value = { object: { x: { y: 1 } } }
  t.deepEqual(jd(value, decoder), value)

  decoder = { object: { x: [Number] } }
  value = { object: { x: [1, 2, 3] } }
  t.deepEqual(jd(value, decoder), value)
})

test('Shared type objects', t => {
  let decoder, value

  // define type
  const UserData = {
    username: String,
    email: String
  }

  // extend it
  const UserDataExtended = Object.assign({},
    UserData,
    { salary: Number }
  )

  decoder = {
    userInfo: UserDataExtended,
    employer: UserData,
    employees: [UserDataExtended]
  }
  value = {
    userInfo: { username: 'Tom', email: 'tom@gmail.com', salary: 100000 },
    employer: { username: 'Anna', email: 'anna@gmail.com' },
    employees: [
      { username: 'Peter', email: 'tom@gmail.com', salary: 50000 },
      { username: 'Nina', email: 'tom@gmail.com', salary: 50000 }
    ]
  }
  t.deepEqual(jd(value, decoder), value)
})

test('Decoder with configuration', t => {
  // TODO: test if type has unsupported value?
  //       if it has unsupported value then should we threat it as regular type
  //       instead of object type?? - could we make it unambiguous
  t.deepEqual(jd('abc', { type: String }), 'abc')
  t.deepEqual(jd(1, { type: Number }), 1)
  t.deepEqual(jd([1], { type: [Number] }), [1])
  t.deepEqual(jd({ a: 1 }, { type: { a: Number } }), { a: 1 })
})

test('Optional', t => {
  // t.deepEqual(jd({a: 1}, { a: Number }), { a: 1 })
  // t.deepEqual(jd({a: 1}, { a: { type: Number, default: 0 } }), { a: 1 })
  // t.deepEqual(jd({}, { a: { type: Number, default: 0 } }), { a: 0 })
})

test('unknown decoder type', t => {
  // TODO: throws but in wrong brach
  t.throws(() => jd(undefined, undefined))
  t.throws(() => jd(0, 0))
  t.throws(() => jd(true, true))

  const f = () => true
  t.throws(() => jd(f, f))

  const f2 = Function
  t.throws(() => jd(f2, f2))

  const nan = NaN
  t.throws(() => jd(nan, nan))
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
