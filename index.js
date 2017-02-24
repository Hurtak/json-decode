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
  constructor (type, children = []) {
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

function jsonDecode (valueInput, decoderInput, path = '<data>') {
  const valueInputType = valueToType(valueInput)

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
  } else if (valueInputType !== decoder.type) {
    return {
      error: {
        message: `Error at ${path} - expected type: ${typeToString(decoder.type)}, given type: ${typeToString(valueInputType)}, given value: ${valueInput}.`,
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
      for (let i = 0; i < valueInput.length; i++) {
        const arrayValue = valueInput[i]
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
            message: `Error at ${path} - the decoder is specified as an object, but there are no properties. Given "{}", expecting "{key: type, …}".`,
            path: path,
            code: 400
          },
          data: null
        }
      }

      for (const objectDecoderKey in decoder.children) {
        if (!decoder.children.hasOwnProperty(objectDecoderKey)) break

        if (!(objectDecoderKey in valueInput)) {
          return {
            error: {
              message: `Error at ${path} - key "${objectDecoderKey}" is missing in the given data. Given: "{key: type}, expecting "{differentKey: type}"`,
              path: path,
              code: 500
            },
            data: null
          }
        }

        const objectDecoder = decoder.children[objectDecoderKey]
        const objectValue = valueInput[objectDecoderKey]
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
    data: valueInput
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
main.null = new Decoder(Type.NULL)
main.boolean = new Decoder(Type.BOOLEAN)
main.number = new Decoder(Type.NUMBER)
main.string = new Decoder(Type.STRING)
// main.array = (...args) => new Decoder(Type.ARRAY, args)
// main.object = (...args) => new Decoder(Type.OBJECT, args)
