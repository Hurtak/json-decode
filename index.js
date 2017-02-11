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

function jsonDecode (dataInput, decoderInput, dataInputWhole = dataInput) {
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
      error: `Expected data type "${typeToString(decoder.type)}", got data type "${typeToString(dataType)}"`,
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
          error: `Decoder is specified as Array but type of its values is not specified`,
          data: null
        }
      } else if (decoder.value.length >= 2) {
        return {
          error: `More than one type of Array values is specified`,
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
          for (const arrayValue of dataInput) {
            const typeArrayValue = dataToType(arrayValue)
            if (typeArrayValue !== typeArrayDecoder) {
              return {
                error: `Array value is ${arrayValue} does not match the decoder ${typeToString(typeArrayDecoder)}.`,
                data: null
              }
            }
          }
          break
        case Type.ARRAY:
        case Type.OBJECT:
          for (const arrayValue of dataInput) {
            const res = jsonDecode(arrayValue, decoderArrayValue, dataInputWhole)
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
          error: `Decoder is specified as Object there are no keys specified in the decoder.`,
          data: null
        }
      }

      for (const decoderObjectKey in decoder.value) {
        if (!decoder.value.hasOwnProperty(decoderObjectKey)) break

        if (!(decoderObjectKey in dataInput)) {
          return {
            error: `Key "${decoderObjectKey}" is missing in the data ${dataInput}.`,
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
              return {
                error: `Object value "${objectValue}" is not the same type of the decoder which is "${typeToString(typeObjectDecoder)}".`,
                data: null
              }
            }
            break
          case Type.ARRAY:
          case Type.OBJECT:
            const res = jsonDecode(objectValue, decoderObjectValue, dataInputWhole)
            if (res.error) {
              return res
            }
            break
        }
      }

      break
    default:
      return {
        error: `Unknown decoder type ${decoder.value}.`,
        data: null
      }
  }

  return {
    error: null,
    data: dataInputWhole
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
