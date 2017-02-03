'use strict'

const _ = require('lodash')

const type = {
  null: 0,
  bool: 1,
  number: 2,
  string: 3,
  array: 4,
  object: 5
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
    case null: return type.null
    case Boolean: return type.bool
    case Number: return type.number
    case String: return type.string
    default:
      throw new Error('TODO array')
  }
}

function dataToAst (input) {
  const inputType = dataToType(input)

  switch (inputType) {
    case type.null:
    case type.bool:
    case type.number:
    case type.string:
      return {
        value: input,
        type: inputType,
        children: null
      }
    case type.array:
      return {
        value: input,
        type: inputType,
        children: input.map(dataToAst)
      }
    case type.object:
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
  if (_.isNull(input)) return type.null
  else if (_.isBoolean(input)) return type.bool
  else if (_.isNumber(input)) return type.number
  else if (_.isString(input)) return type.string
  else if (_.isArray(input)) return type.array
  else if (_.isObject(input)) return type.object

  throw new Error('TODO')
}

function typeToString (type) {
  switch (type) {
    case type.null: return 'null'
    case type.bool: return 'bool'
    case type.number: return 'number'
    case type.string: return 'string'
    case type.array: return 'array'
    case type.object: return 'object'
    default: return 'unknown'
  }
}

module.exports = jsonDecode
