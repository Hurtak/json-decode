'use strict'

function jsonDecode (data, decoder) {
    if (data === decoder) {
        return data
    } else {
        throw new TypeError(`Expected data type "${typeLiteralToString(decoder)}", got data type "${dataToTypeString(data)}"`)
    }
}

// TODO: `type literal` is probably the wrong name
function typeLiteralToString (type) {
    if (type === null) {
        return 'null'
    } else if (type === Boolean) {
        return 'bool'
    } else if (type === Number) {
        return 'number'
    } else if (type === String) {
        return 'string'
    } else if (Array.isArray(type)) {
        return 'array'
    } else if (typeof type === 'object') {
        // VOLATILE: what if we pass Funtions, Array.prototype, Math, new Number(1)
        return 'object'
    } else {
        return 'UNKNOWN'
    }
}

function dataToTypeString (data) {
    return 'TODO'
}

module.exports = jsonDecode
