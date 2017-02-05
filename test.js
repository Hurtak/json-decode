import test from 'ava'

import jd from './index.js'

// Basic data types

const dataTypesBasic = {
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
    [Number, 123456789],
    [Number, Number.MAX_SAFE_INTEGER],
    [Number, Number.MIN_SAFE_INTEGER]
  ],

  string: [
    // TODO: what string values are supported? test some esoteric characters
    [String, ''],
    [String, 'string'],
    // [String, '0123456789'.repeat(10)],
    // [String, '0123456789'.repeat(1000)]
  ]
}

// Collections with basic data types

let dataTypeArrayOfBasicTypes = []
for (const key in dataTypesBasic) {
  const type = dataTypesBasic[key]

  const arrayDecoder = [type[0][0]]
  const arrayValues = type.map(([decoder, value]) => value)

  dataTypeArrayOfBasicTypes.push([ arrayDecoder, arrayValues ])
}

let dataTypeObjectOfBasicTypes = []
const object = {}
for (const key in dataTypesBasic) {
  const type = dataTypesBasic[key]

  type.forEach((value, index) => {
    object[`${key}_${index}`] = value
  })
}
dataTypeObjectOfBasicTypes.push(object)

// Add objects to arrays as arays of objects

const dataTypeArrayOfObjects = dataTypeObjectOfBasicTypes.map(object => {
  const decoder = {}
  const value = {}
  for (const key in object) {
    decoder[key] = object[key][0]
    value[key] = object[key][1]
  }

  return [[decoder], [value]]
})

// Add array data to objects

const dataTypeObjectOfArrays = dataTypeArrayOfBasicTypes
  .map((value, index) => ({ [`array_${index}`]: value }))

// Marge together data types collections
const testData = Object.assign(
  {},
  dataTypesBasic,
  { array: [...dataTypeArrayOfBasicTypes, ...dataTypeArrayOfObjects] },
  { object: [...dataTypeObjectOfBasicTypes, ...dataTypeObjectOfArrays] }
)

test('Null', t => {
  const type = null
  const decoder = null

  t.deepEqual(jd(type, decoder), type)
  t.throws(() => jd(true, decoder))
  t.throws(() => jd(false, decoder))
  t.throws(() => jd(0, decoder))
  t.throws(() => jd(1, decoder))
})


test.skip('basic types 2 ', t => {
  const tests = [
    [null, 'null'],
    [Boolean, 'boolean'],
    [Number, 'number'],
    [String, 'string']
  ]

  for (const [decoder, decoderName] of tests) {
    const typeTested = testData[decoderName]
    const typeOthers = Object.keys(testData)
      .filter(key => key !== decoderName)
      .map(key => testData[key])
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
