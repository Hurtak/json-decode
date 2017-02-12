'use strict'

const _ = require('lodash')

const Type = {
  NULL: 0,
  BOOLEAN: 1,
  NUMBER: 2,
  STRING: 3,
  ARRAY: 4,
  OBJECT: 5,
  UNKNOWN: 6
}

const DecoderCategory = {
  STANDARD: 0,
  UNION: 1, // TODO
  TUPLE: 2 // TODO
}

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

  // VOLATILE: what if user has object with type as a key - { type: stuff }
  let decoderValue
  let decoderCategory
  let decoderType

  if (_.isPlainObject(decoderInput)) {
    if ('$type' in decoderInput) {
      // Decoder with configuration, eg.: `{ $type: Number }`
      decoderType = decoderToType(decoderInput.$type)
      decoderValue = decoderInput.$type
      decoderCategory = DecoderCategory.STANDARD
    } else {
      // Object decoder
      decoderValue = decoderInput
      decoderType = decoderToType(decoderValue)
      decoderCategory = DecoderCategory.STANDARD
    }
  } else {
    // Decoder with no configuration, eg.: `Number`
    decoderValue = decoderInput
    decoderType = decoderToType(decoderValue)
    decoderCategory = DecoderCategory.STANDARD
  }

  const decoder = {
    value: decoderValue,
    type: decoderType,
    category: decoderCategory
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
      if (decoder.value.length === 0) {
        return {
          error: {
            message: `Error at ${path} - the decoder is specified as an array, but the type of its values is missing. Given "[]", expecting "[type]".`,
            path: path,
            code: 200
          },
          data: null
        }
      } else if (decoder.value.length >= 2) {
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

      const arrayDecoder = decoder.value[0]
      for (let i = 0; i < valueInput.length; i++) {
        const arrayValue = valueInput[i]
        const res = jsonDecode(arrayValue, arrayDecoder, `${path}[${i}]`)
        if (res.error) {
          return res
        }
      }

      break
    case Type.OBJECT:
      if (Object.keys(decoder.value).length === 0) {
        return {
          error: {
            message: `Error at ${path} - the decoder is specified as an object, but there are no properties. Given "{}", expecting "{key: type, …}".`,
            path: path,
            code: 400
          },
          data: null
        }
      }

      for (const objectDecoderKey in decoder.value) {
        if (!decoder.value.hasOwnProperty(objectDecoderKey)) break

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

        const objectDecoder = decoder.value[objectDecoderKey]
        const objectValue = valueInput[objectDecoderKey]
        const res = jsonDecode(objectValue, objectDecoder, `${path}.${objectDecoderKey}`)
        if (res.error) {
          return res
        }
      }
      break
    default:
      break
  }

  return {
    error: null,
    data: valueInput
  }
}

function decoderToType (input) {
  switch (input) {
    case null: return Type.NULL
    case Boolean: return Type.BOOLEAN
    case Number: return Type.NUMBER
    case String: return Type.STRING
    default:
      if (_.isArray(input)) return Type.ARRAY
      else if (_.isPlainObject(input)) return Type.OBJECT
      else return Type.UNKNOWN
  }
}

function valueToType (input) {
  if (_.isNull(input)) return Type.NULL
  else if (_.isBoolean(input)) return Type.BOOLEAN
  else if (_.isNumber(input)) return Type.NUMBER
  else if (_.isString(input)) return Type.STRING
  else if (_.isArray(input)) return Type.ARRAY
  else if (_.isPlainObject(input)) return Type.OBJECT
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
}

module.exports = main
