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

const decoderDefaults = {
  optional: false
}

// VOLATILE: path attribute should not be public
function jsonDecode (dataInput, decoderInput, path = '<data>') {
  const dataInputType = dataToType(dataInput)

  // VOLATILE: what if user has object with type as a key - { type: stuff }
  const isDecoderAsObject = _.isObject(decoderInput) && 'type' in decoderInput
  const decoderInputValue = isDecoderAsObject ? decoderInput.type : decoderInput
  const decoder = Object.assign(
    {},
    decoderDefaults,
    {
      value: decoderInputValue,
      type: decoderToType(decoderInputValue)
    }
  )

  if (dataInputType !== decoder.type) {
    return {
      error: {
        message: `Expected data type "${typeToString(decoder.type)}", got data type "${typeToString(dataInputType)}"`,
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
            message: `Decoder is specified as Array but type of its values is not specified`,
            path: path,
            code: 200
          },
          data: null
        }
      } else if (decoder.value.length >= 2) {
        // TODO: maybe this should not be error but implicit tuple decoding
        return {
          error: {
            message: `More than one type of Array values is specified`,
            path: path,
            code: 300
          },
          data: null
        }
      }

      const arrayDecoder = decoder.value[0]
      for (let i = 0; i < dataInput.length; i++) {
        const arrayValue = dataInput[i]
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
            message: `Decoder is specified as Object there are no keys specified in the decoder.`,
            path: path,
            code: 400
          },
          data: null
        }
      }

      for (const objectDecoderKey in decoder.value) {
        if (!decoder.value.hasOwnProperty(objectDecoderKey)) break

        if (!(objectDecoderKey in dataInput)) {
          return {
            error: {
              message: `Key "${objectDecoderKey}" is missing in the data ${dataInput}.`,
              path: path,
              code: 500
            },
            data: null
          }
        }

        const objectDecoder = decoder.value[objectDecoderKey]
        const objectValue = dataInput[objectDecoderKey]
        const res = jsonDecode(objectValue, objectDecoder, `${path}.${objectDecoderKey}`)
        if (res.error) {
          return res
        }
      }
      break
    default:
      return {
        error: {
          message: `Unknown decoder type ${decoder.value}.`,
          path: path,
          code: 600
        },
        data: null
      }
  }

  return {
    error: null,
    data: dataInput
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
      else if (_.isObject(input)) return Type.OBJECT
      else return Type.UNKNOWN
  }
}

function dataToType (input) {
  if (_.isNull(input)) return Type.NULL
  else if (_.isBoolean(input)) return Type.BOOLEAN
  else if (_.isNumber(input)) return Type.NUMBER
  else if (_.isString(input)) return Type.STRING
  else if (_.isArray(input)) return Type.ARRAY
  else if (_.isObject(input)) return Type.OBJECT
  else return Type.UNKNOWN
}

function typeToString (type) {
  switch (type) {
    case Type.NULL: return 'null'
    case Type.BOOLEAN: return 'bool'
    case Type.NUMBER: return 'number'
    case Type.STRING: return 'string'
    case Type.ARRAY: return 'array'
    case Type.OBJECT: return 'object'
    case Type.UNKNOWN: return 'unknown'
  }
}

module.exports = jsonDecode
