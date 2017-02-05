import test from 'ava'

import jd from './index.js'

const dataBasic = {
  null: [
    null
  ],

  boolean: [
    true,
    false
  ],

  number: [
    0,
    1,
    -1,
    123456789,
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER
  ],

  string: [
    '',
    'string',
    '0123456789'.repeat(10),
    '0123456789'.repeat(1000)
  ]
}

test('basic types 2 ', t => {
  const tests = [
    [null, 'null'],
    [Boolean, 'boolean'],
    [Number, 'number'],
    [String, 'string']
  ]

  for (const [decoder, decoderName] of tests) {
    const typeTested = dataBasic[decoderName]
    const typeOthers = Object.keys(dataBasic)
      .filter(key => key !== decoderName)
      .map(key => dataBasic[key])
      .reduce((aggregated, currentValue) => [...aggregated, ...currentValue]) // flatten

    for (const item of typeTested) {
      t.deepEqual(jd(item, decoder), item)
    }

    for (const item of typeOthers) {
      t.throws(() => jd(item, decoder))
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

test('decoder with configuration', t => {
  // TODO: test if type has unsupported value?
  //       if it has unsupported value then should we threat it as regular type
  //       instead of object type?? - could we make it unambiguous
  t.deepEqual(jd('abc', { type: String }), 'abc')
  t.deepEqual(jd(1, { type: Number }), 1)
  t.deepEqual(jd([1], { type: [Number] }), [1])
  t.deepEqual(jd({ a: 1 }, { type: { a: Number } }), { a: 1 })
})

test('optional', t => {

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

  // type + validation function
  jd.decode(data, jd.validate(Number, x => x >= 200 && x < 300))

  // type + optional validation function
  jd.decode(data, jd.validate(jd.optional(Number, 0), x => x >= 200 && x < 300))
  jd.decode(data, { type: Number, default: 0, validation: x => x >= 200 && x < 300 })

  // union types
  jd.decode(data, [jd.number, jd.null])

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
