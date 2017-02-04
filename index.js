'use strict'

const _ = require('lodash')

const Type = {
  NULL: 0,
  BOOLEAN: 1,
  NUMBER: 2,
  STRING: 3,
  ARRAY: 4,
  OBJECT: 5
}

const decoderDefaults = {
  optional: false
}

function jsonDecode (dataInput, decoderInput) {
  const dataType = dataToType(dataInput)

  const isDecoderAsObject = _.isObject(decoderInput) && 'type' in decoderInput // VOLATILE: what if user has object with type as a key - { type: stuff }
  const decoderInputValue = isDecoderAsObject ? decoderInput.type : decoderInput
  const decoder = Object.assign(
    {},
    decoderDefaults,
    {
      value: decoderInputValue, // TODO: unused?
      type: decoderToType(decoderInputValue)
    }
  )

  switch (decoder.type) {
    case Type.NULL:
    case Type.BOOLEAN:
    case Type.NUMBER:
    case Type.STRING:
      if (dataType !== decoder.type) {
        throw new TypeError(`Expected data type "${typeToString(decoder.type)}", got data type "${typeToString(dataType)}"`)
      }
      break
    case Type.ARRAY:
      if (decoder.value.length === 0) {
        throw new Error(`Decoder is specified as Array but type of its values is not specified`)
      } else if (decoder.value.length >= 2) {
        throw new Error(`More than one type of Array values is specified`)
      }

      const typeArrayDecoder = decoderToType(decoder.value[0])
      for (const arrayValue of dataInput) {
        const typeArrayValue = dataToType(arrayValue)
        if (typeArrayValue !== typeArrayDecoder) {
          throw new TypeError(`Array value is ${arrayValue} does not match the decoder ${typeToString(typeArrayDecoder)}.`)
        }
      }
      break
    case Type.OBJECT:
      if (Object.keys(decoder.value).length === 0) {
        throw new Error(`Decoder is specified as Object there are no keys specified in the decoder`)
      }

      for (const decoderObjectKey in decoder.value) {
        if (!decoder.value.hasOwnProperty(decoderObjectKey)) break

        if (!(decoderObjectKey in dataInput)) {
          throw new Error(`Key "${decoderObjectKey}" is missing in the data`)
        }

        const objectValue = dataInput[decoderObjectKey]
        const typeObjectDecoder = decoderToType(decoder.value[decoderObjectKey])
        const typeObjectValue = dataToType(objectValue)
        if (typeObjectDecoder !== typeObjectValue) {
          throw new TypeError(`Object value "${objectValue}" is not the same type of the decoder which is "${typeToString(typeObjectDecoder)}".`)
        }
      }
      // if (decoder.length === 0) {
      //   throw new Error(`Decoder is specified as Array but type of its values is not specified`)
      // } else if (decoder.length >= 2) {
      //   throw new Error(`More than one type of Array values is specified`)
      // }

      // const typeArrayDecoder = decoderToType(decoder[0])
      // for (const arrayItem of data) {
      //   const typeArrayItem = dataToType(arrayItem)
      //   if (typeArrayItem !== typeArrayDecoder) {
      //     throw new TypeError(`Array value is ${arrayItem} does not match the decoder ${typeToString(typeArrayDecoder)}.`)
      //   }
      // }
      break
  }

  return dataInput
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

      throw new Error('unknown')
  }
}

function dataToAst (input) {
  const inputType = dataToType(input)

  switch (inputType) {
    case Type.NULL:
    case Type.BOOLEAN:
    case Type.NUMBER:
    case Type.STRING:
      return {
        value: input,
        type: inputType,
        children: null
      }
    case Type.ARRAY:
      return {
        value: input,
        type: inputType,
        children: input.map(dataToAst)
      }
    case Type.OBJECT:
      return {
        value: input,
        type: inputType,
        children: Object.keys(input).map(key => ({
          key: key,
          value: dataToAst(input[key])
        }))
      }
  }
}

function dataToType (input) {
  if (_.isNull(input)) return Type.NULL
  else if (_.isBoolean(input)) return Type.BOOLEAN
  else if (_.isNumber(input)) return Type.NUMBER
  else if (_.isString(input)) return Type.STRING
  else if (_.isArray(input)) return Type.ARRAY
  else if (_.isObject(input)) return Type.OBJECT

  throw new Error('TODO')
}

function typeToString (type) {
  switch (type) {
    case Type.NULL: return 'null'
    case Type.BOOLEAN: return 'bool'
    case Type.NUMBER: return 'number'
    case Type.STRING: return 'string'
    case Type.ARRAY: return 'array'
    case Type.OBJECT: return 'object'
    default: return 'unknown'
  }
}

module.exports = jsonDecode
