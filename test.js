import test from 'ava'

import jd from './index.js'

test('basic types', t => {
  t.is(jd(null, null), null)
  // t.is(jd(true, Boolean), true)
  // t.is(jd(false, Boolean), false)
  // jd(data, Boolean)
  // jd(data, Number)
  // jd(data, String)
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
