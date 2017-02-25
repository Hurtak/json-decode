'use strict'

//
// Enums
//

const Type = {
  NULL: 0,
  BOOLEAN: 1,
  NUMBER: 2,
  STRING: 3,
  ARRAY: 4,
  OBJECT: 5,
  UNKNOWN: 6
}

class Decoder {
  constructor (type, children) {
    this._type = type
    this._children = children
  }
}

//
// Main functions
//

function main (value, decoder) {
  const argsNumber = arguments.length
  // TODO: Maybe validation errors should throw byt decoding errors should be return value.
  //       If ve do this we should move decoder validation at the top.
  if (argsNumber === 0) throw new Error('Wrong number of arguments, given 0 arguments, expecting 2 - value and decoder.')
  if (argsNumber === 1) throw new Error('Wrong number of arguments, given 1 argument, expecting 2 - value and decoder.')
  if (argsNumber >= 3) throw new Error(`Wrong number of arguments, given ${argsNumber} arguments, expecting 2 - value and decoder.`)

  return jsonDecode(value, decoder)
}

function jsonDecode (value, decoderInput, path = '<data>') {
  const valueType = valueToType(value)

  // TODO: this failed here
  // [jd.object({ null: null }), { null: null }],
  // add new error message
  // it should have been jd.null instead of null
  const decoder = {
    children: decoderInput._children,
    type: decoderInput._type
  }

  if (decoder.type === Type.UNKNOWN) {
    return {
      error: {
        message: `Error at ${path} - unknown decoder.`,
        path: path,
        code: 600
      },
      data: null
    }
  } else if (valueType !== decoder.type) {
    return {
      error: {
        message: `Error at ${path} - expected type: ${typeToString(decoder.type)}, given type: ${typeToString(valueType)}, given value: ${value}.`,
        path: path,
        code: 100
      },
      data: null
    }
  }

  switch (decoder.type) {
    case Type.NULL:
    case Type.BOOLEAN:
    case Type.NUMBER:
    case Type.STRING:
      break
    case Type.ARRAY:
      if (decoder.children.length === 0) {
        return {
          error: {
            message: `Error at ${path} - the decoder is specified as an array, but the type of its values is missing. Given "[]", expecting "[type]".`,
            path: path,
            code: 200
          },
          data: null
        }
      } else if (decoder.children.length >= 2) {
        // TODO: maybe this should not be error but implicit tuple decoding
        //       if not, put real values into "[type, type, …]"
        return {
          error: {
            message: `Error at ${path} - more than one type of array values is specified, please specify only one. Given "[type, type, …]", expecting "[type]".`,
            path: path,
            code: 300
          },
          data: null
        }
      }

      const arrayDecoder = decoder.children[0]
      for (let i = 0; i < value.length; i++) {
        const arrayValue = value[i]
        const res = jsonDecode(arrayValue, arrayDecoder, `${path}[${i}]`)
        if (res.error) {
          return res
        }
      }

      break
    case Type.OBJECT:
      if (Object.keys(decoder.children).length === 0) {
        return {
          error: {
            // TODO: outdated error mesasge
            message: `Error at ${path} - the decoder is specified as an object, but there are no properties. Given "{}", expecting "{key: type, …}".`,
            path: path,
            code: 400
          },
          data: null
        }
      }
      if (Object.keys(decoder.children).length >= 2) {
        return {
          error: {
            // TODO: tests
            message: `Error at ${path} - the decoder is specified as an object, but there more than one objects passed into the decoder. Given "jd.object({a: jd.string}, {b: jd.number})", expecting "jd.object({a: jd.string})".`,
            path: path,
            code: 450
          },
          data: null
        }
      }
      // TODO: test for when passed decoder is not object, eg jd.object('hello')

      const rootObjectDecoder = decoder.children[0]
      for (const objectDecoderKey in rootObjectDecoder) {
        if (!rootObjectDecoder.hasOwnProperty(objectDecoderKey)) break

        // console.log(value)
        // console.log('objectDecoderKey', objectDecoderKey)
        // console.log('rootObjectDecoder', rootObjectDecoder)
        if (!(objectDecoderKey in value)) {
          return {
            error: {
              message: `Error at ${path} - key "${objectDecoderKey}" is missing in the given data. Given: "{key: type}, expecting "{differentKey: type}"`,
              path: path,
              code: 500
            },
            data: null
          }
        }

        const objectDecoder = rootObjectDecoder[objectDecoderKey]
        const objectValue = value[objectDecoderKey]
        const res = jsonDecode(objectValue, objectDecoder, `${path}.${objectDecoderKey}`)
        if (res.error) {
          return res
        }
      }
      break
    default:
      console.assert(false) // TODO remove
      break
  }

  return {
    error: null,
    data: value
  }
}

//
// Type detection
//

const isPlainObject = require('lodash/isPlainObject')
const isNull = x => x === null
const isBoolean = x => x === true || x === false
const isNumber = x => typeof x === 'number'
const isString = x => typeof x === 'string'
const isArray = x => Array.isArray(x)

//
// Type conversion
//

function valueToType (input) {
  if (isNull(input)) return Type.NULL
  else if (isBoolean(input)) return Type.BOOLEAN
  else if (isNumber(input)) return Type.NUMBER
  else if (isString(input)) return Type.STRING
  else if (isArray(input)) return Type.ARRAY
  else if (isPlainObject(input)) return Type.OBJECT
  else return Type.UNKNOWN
}

function typeToString (type) {
  switch (type) {
    case Type.NULL: return 'null'
    case Type.BOOLEAN: return 'boolean'
    case Type.NUMBER: return 'number'
    case Type.STRING: return 'string'
    case Type.ARRAY: return 'array'
    case Type.OBJECT: return 'object'
    case Type.UNKNOWN: return 'unknown'
  }
  console.assert(false) // TODO remove
}

//
// Export
//

module.exports = main

const exportedTypes = {
  // TODO: test if null (and other types) are new Decoder instances and are not reused
  get null () { return new Decoder(Type.NULL) },
  get boolean () { return new Decoder(Type.BOOLEAN) },
  get number () { return new Decoder(Type.NUMBER) },
  get string () { return new Decoder(Type.STRING) },
  array (...children) { return new Decoder(Type.ARRAY, children) },
  object (...children) { return new Decoder(Type.OBJECT, children) }
}

main.null = exportedTypes.null
main.boolean = exportedTypes.boolean
main.number = exportedTypes.number
main.string = exportedTypes.string
main.array = exportedTypes.array
main.object = exportedTypes.object
