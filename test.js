import test from 'ava'

import jd from './index.js'

// Basic data types

const dataTypes = {
  // dataType: [ [dataDecoder, dataValue] ]

  null: [
    [null, null]
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
    [ [null], [null] ],
    [ [Boolean], [true, false] ],
    [ [Number], [0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER] ],
    [ [String], ['', 'hello there'] ],

    [ [{ null: null }], [{ null: null }] ],
    [ [{ boolean: Boolean }], [{ boolean: true }] ],
    [ [{ number: Number }], [{ number: 1 }] ],
    [ [{ string: String }], [{ string: 'hello there' }] ]
  ],

  object: [
    [ { null: null }, { null: null } ],
    [ { boolean: Boolean }, { boolean: true } ],
    [ { number: Number }, { number: 1 } ],
    [ { string: String }, { string: 'hello there' } ],

    [ { string: [null] }, { string: [null] } ],
    [ { string: [Boolean] }, { string: [true, false] } ],
    [ { string: [Number] }, { string: [0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER] } ],
    [ { string: [String] }, { string: ['hello there'] } ]
  ]
}

// Collections with basic data types

test('Types matrix', t => {
  for (const keyType in dataTypes) {
    const type = dataTypes[keyType]

    for (const [decoder, value] of type) {
      // decoder should correctly decode value
      t.deepEqual(jd(value, decoder), value)

      for (const keyTypeAgain in dataTypes) {
        if (keyTypeAgain === keyType) continue

        const typeOther = dataTypes[keyTypeAgain]
        for (const [decoderOther, valueOther] of typeOther) {
          // decoder should not decode agains values from other data types
          t.throws(() => jd(valueOther, decoder))

          // value should not decode agains decoders from other types
          t.throws(() => jd(value, decoderOther))
        }
      }
    }
  }
})

test('basic types', t => {
  t.deepEqual(jd(true, Boolean), true)
  t.deepEqual(jd(false, Boolean), false)

  t.deepEqual(jd(0, Number), 0)
  t.deepEqual(jd(1, Number), 1)
  t.deepEqual(jd(-1, Number), -1)
  t.deepEqual(jd(Number.MAX_SAFE_INTEGER, Number), Number.MAX_SAFE_INTEGER)
  t.deepEqual(jd(Number.MIN_SAFE_INTEGER, Number), Number.MIN_SAFE_INTEGER)

  t.deepEqual(jd('', String), '')
  t.deepEqual(jd('a', String), 'a')
  t.deepEqual(jd('0123456789'.repeat(10), String), '0123456789'.repeat(10))
  t.deepEqual(jd('0123456789'.repeat(1000), String), '0123456789'.repeat(1000))

  t.throws(() => jd([], []), [])
  t.deepEqual(jd([], [Number]), [])
  t.deepEqual(jd([1], [Number]), [1])
  t.deepEqual(jd([1, 2, 3], [Number]), [1, 2, 3])
  t.deepEqual(jd(['abc'], [String]), ['abc'])
  t.deepEqual(jd([null], [null]), [null])
  t.deepEqual(jd([true], [Boolean]), [true])

  t.deepEqual(jd({ number: 1 }, { number: Number }), { number: 1 })
  t.throws(() => jd({}, {}))
  t.throws(() => jd({}, { number: Number }))
  t.throws(() => jd({ number: '' }, { number: Number }))
})

test('Nested types', t => {
  t.deepEqual(jd([], [{ a: Number }]), [])
  t.deepEqual(jd([{ a: 1 }], [{ a: Number }]), [{ a: 1 }])
  t.throws(() => jd([{}], [{ a: Number }]))
  t.throws(() => jd([{ a: false }], [{ a: Number }]))

  t.deepEqual(jd({ a: [] }, { a: [Number] }), { a: [] })
  t.deepEqual(jd({ a: [1] }, { a: [Number] }), { a: [1] })
  t.throws(() => jd({}, { a: [Number] }))
  t.throws(() => jd({ a: [false] }, { a: [Number] }))
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
