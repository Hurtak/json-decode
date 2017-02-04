'use strict'

const _ = require('lodash')

const Type = {
  NULL: 0,
  BOOL: 1,
  NUMBER: 2,
  STRING: 3,
  ARRAY: 4,
  OBJECT: 5
}

function jsonDecode (data, decoder) {
  const typeData = dataToType(data)
  const typeDecoder = decoderToType(decoder)

  if (typeData !== typeDecoder) {
    throw new TypeError(`Expected data type "${typeToString(typeDecoder)}", got data type "${typeToString(typeData)}"`)
  }

  return data
}

function decoderToType (input) {
  switch (input) {
    case null: return Type.NULL
    case Boolean: return Type.BOOL
    case Number: return Type.NUMBER
    case String: return Type.STRING
    default:
      throw new Error('TODO array')
  }
}

function dataToAst (input) {
  const inputType = dataToType(input)

  switch (inputType) {
    case Type.NULL:
    case Type.BOOL:
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
  else if (_.isBoolean(input)) return Type.BOOL
  else if (_.isNumber(input)) return Type.NUMBER
  else if (_.isString(input)) return Type.STRING
  else if (_.isArray(input)) return Type.ARRAY
  else if (_.isObject(input)) return Type.OBJECT

  throw new Error('TODO')
}

function typeToString (type) {
  switch (type) {
    case Type.NULL: return 'null'
    case Type.BOOL: return 'bool'
    case Type.NUMBER: return 'number'
    case Type.STRING: return 'string'
    case Type.ARRAY: return 'array'
    case Type.OBJECT: return 'object'
    default: return 'unknown'
  }
}

module.exports = jsonDecode
