import test from 'ava'

import jd from './index.js'

test('basic types', t => {
  t.is(jd(null, null), null)

  t.is(jd(true, Boolean), true)
  t.is(jd(false, Boolean), false)

  t.is(jd(0, Number), 0)
  t.is(jd(1, Number), 1)
  t.is(jd(-1, Number), -1)
  t.is(jd(Number.MAX_SAFE_INTEGER, Number), Number.MAX_SAFE_INTEGER)
  t.is(jd(Number.MIN_SAFE_INTEGER, Number), Number.MIN_SAFE_INTEGER)

  t.is(jd('', String), '')
  t.is(jd('a', String), 'a')
  t.is(jd('0123456789'.repeat(10), String), '0123456789'.repeat(10))
  t.is(jd('0123456789'.repeat(1000), String), '0123456789'.repeat(1000))

  t.throws(() => jd([], []), [])
  t.deepEqual(jd([], [Number]), [])
  t.deepEqual(jd([1], [Number]), [1])
  t.deepEqual(jd([1, 2, 3], [Number]), [1, 2, 3])

  // union types????
  // t.is(jd([1], { type: [Number] }), [1])
  // t.is(jd([1], { type: Array, values: Number }), [1])
  // t.is(jd([1], [{ type: Number }]), [1])

  // jd(data, [Boolean])
  // jd(data, [Number])
  // jd(data, [String])
  // jd(data, {})

/*
  // type
  const data = 200
  jd.decode(data, Number)

  // type + validation function
  jd.decode(data, jd.validate(Number, x => x >= 200 && x < 300))

  // type + optional
  jd.decode(data, jd.optional(Number, 0))

  // type + optional validation function
  jd.decode(data, jd.validate(jd.optional(Number, 0), x => x >= 200 && x < 300))
  jd.decode(data, { type: Number, default: 0, validation: x => x >= 200 && x < 300 })

  // union types
  jd.decode(data, [jd.number, jd.null])

  // decode array
  const data2 = [1, 2, 3]
  jd.decode(data2, [jd.number])


  jd.decode(data2, {
    normal: Number,

    // TODO: what if user passe
    optional: { type: Number, default: 0 },

    array: [String],
    arrayOptional: { type: [String], default: [] },

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
})
