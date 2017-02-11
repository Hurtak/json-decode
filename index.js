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
  const dataType = dataToType(dataInput)

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

  if (dataType !== decoder.type) {
    return {
      error: {
        message: `Expected data type "${typeToString(decoder.type)}", got data type "${typeToString(dataType)}"`,
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
        return {
          error: {
            message: `More than one type of Array values is specified`,
            path: path,
            code: 300
          },
          data: null
        }
      }

      const decoderArrayValue = decoder.value[0]
      const typeArrayDecoder = decoderToType(decoderArrayValue)
      switch (typeArrayDecoder) {
        case Type.NULL:
        case Type.BOOLEAN:
        case Type.NUMBER:
        case Type.STRING:
          for (let i = 0; i < dataInput.length; i++) {
            const arrayValue = dataInput[i]
            const typeArrayValue = dataToType(arrayValue)
            if (typeArrayValue !== typeArrayDecoder) {
              path += `[${i}]`
              return {
                error: {
                  message: `Array value is ${arrayValue} does not match the decoder ${typeToString(typeArrayDecoder)}.`,
                  path: path,
                  code: 400
                },
                data: null
              }
            }
          }
          break
        case Type.ARRAY:
        case Type.OBJECT:
          for (const arrayValue of dataInput) {
            const res = jsonDecode(arrayValue, decoderArrayValue, path)
            if (res.error) {
              return res
            }
          }
          break
      }
      break
    case Type.OBJECT:
      if (Object.keys(decoder.value).length === 0) {
        return {
          error: {
            message: `Decoder is specified as Object there are no keys specified in the decoder.`,
            path: path,
            code: 500
          },
          data: null
        }
      }

      for (const decoderObjectKey in decoder.value) {
        if (!decoder.value.hasOwnProperty(decoderObjectKey)) break

        if (!(decoderObjectKey in dataInput)) {
          path += `.${decoderObjectKey}`
          return {
            error: {
              message: `Key "${decoderObjectKey}" is missing in the data ${dataInput}.`,
              path: path,
              code: 600
            },
            data: null
          }
        }

        const decoderObjectValue = decoder.value[decoderObjectKey]
        const objectValue = dataInput[decoderObjectKey]
        const typeObjectDecoder = decoderToType(decoderObjectValue)
        const typeObjectValue = dataToType(objectValue)

        switch (typeObjectDecoder) {
          case Type.NULL:
          case Type.BOOLEAN:
          case Type.NUMBER:
          case Type.STRING:
            if (typeObjectDecoder !== typeObjectValue) {
              path += `.${decoderObjectKey}`
              return {
                error: {
                  message: `Object value "${objectValue}" is not the same type of the decoder which is "${typeToString(typeObjectDecoder)}".`,
                  path: path,
                  code: 700
                },
                data: null
              }
            }
            break
          case Type.ARRAY:
          case Type.OBJECT:
            const res = jsonDecode(objectValue, decoderObjectValue, path)
            if (res.error) {
              return res
            }
            break
        }
      }

      break
    default:
      return {
        error: {
          message: `Unknown decoder type ${decoder.value}.`,
          path: path,
          code: 800
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
