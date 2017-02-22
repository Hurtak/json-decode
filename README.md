# json-decode

## TODO

- features
    - new api?
        jd.Object({
            x: jd.Number,
            x: jd.Number.nullable,
            x: jd.Number.default(10),
            x: jd.Number.default(10).validate(x => x > 0),
            arr: jd.Array(jd.Object({
                    x: jd.Number.nullable
                })
            ).default([]),
            value: jd.Boolean.default(false).rename('isCentral'),
            value: jd.Boolean.default(false).camelCase
        })
    - inspiration
        - c#
        - elm
    - optional types
        - decoding error should 'bubble up' to the nearest default value
            decoder
                {
                    a: {
                        type: {
                            b: {
                                c: Number
                            }
                        },
                        defaultValue: null
                    }
                }
            value
                { a: { b: c: null } }
            returned value
                { a: null }
        implement
            maybe global to camel case flag?
            (non)nullable global flag
            transform
                - example where we take nulled items and filter them out
                {
                    users: [
                        type: String
                        transform: users => users.filter(user => user !== null)
                    ]
                }
                - or with strict types
                {
                    users: {
                    type: [{
                        unionType: [String, null],
                        default: null
                        transform: users => users.filter(user => user !== null)
                    }],
                    default: []
                }
                }
        - maybe field should be optional by default? eg relay?
        - add to the return type
            // list of paths where defaults were applied
            // desperately needs better API
            defaults: [
                "wholeDecodedValue.b[0].c",
                "wholeDecodedValue.b[1].c",
                "wholeDecodedValue.b[2].c",
                "wholeDecodedValue.b[3].c",
            ]
    - treat undefined the same as null
        - in case we want to decode/validate other pieces of data
    - union types
        - possible names `unionType`
        - [null, 1, null, 10, 10]
        - {unionType: [Number, null]}
    - TODO
        - how do we differenciate between
            - decoder object with property type { type: Number }
            - decoder with configuration { type: Number }
            - for now we will just use `$` for config stuff { $type: Number }
    - consider flipping the arguments??
        - jd(value, decoder) -> jd(decoder, value)
    - tuples
        - ["Ok", 1, 1]
        - {tuple: [String, Number, Number]}
    - walk through the whole object to determine what is wrong?
        - return array of errors instead of one error?
    - consider putting decoder validation at the top
        - currenty if we have
            - value "10"
            - decoder [Nonsens]
            - we detect type mismatch String<->Array but not invalid decoder because we are comparing one by one recursively and we did not get to the nested invalid decoder value yet
    - introduce any type for really weird data
        - all checks just would be skipped
        - syntax
            { key: jd.any }
            { key: "any" }
    - maybe introduce back the validation function?
        { type: Number, default: 0, validation: x => x >= 0 }
            - that would be only true/false thing but what if we want to fix the value?
                - { validation: x => x <= 0 ? 0 : x }
            - is this even a good idea to have validation stuff in this lib?
    - global flag to make everything optional/or everything mandatory
    - nullable: true flag?
        - { type: Number, nullable: true } - means it could be Number or null
        - is this really better than { unionType: [Number, null] }
        - probably not
    - add tests for stuff like
        - data contains NaN, Infinite, -Infinite or other garbage like functions

- when done
    - remove console.assert(false)
    - package.json
        - author
        - description
        - keywords
        - https://github.com/avajs/ava/blob/master/package.json
    - cleanup error codes
        - document error codes
    - browser build
        - regular
        - min
        - should work with require, import, window.jsonDecode
    - code coverage?

- docs
    - probable Array.isArray is needed, mention
    - mention
        - minified size
        - minified + gzipped
    - minimum supported node version
    - compare to json schema
        - code over configuration
             "oneOf": [
                { "$ref": "#/definitions/diskDevice" },
                { "$ref": "#/definitions/diskUUID" },
                { "$ref": "#/definitions/nfs" },
                { "$ref": "#/definitions/tmpfs" }
            ]
            vs
            const values = [
                '#/definitions/diskDevice',
                '#/definitions/diskUUID',
                '#/definitions/nfs',
                '#/definitions/tmpfs'
            ]
            { type: String, default: x => values.some(value => value === x)}
        - another examples - minimum maxumum
        - ref
            - "address": {"$ref": "/SimpleAddress"},
            - vs
                - address: SimpleAddress // direct use of object type, no stringly typed stuff
        - jsonschema docs
            - http://json-schema.org/example2.html
            - https://github.com/tdegrunt/jsonschema
- solidness
    - travis CI automatic tests
    - benchmark
        - https://github.com/bestiejs/benchmark.js
    - linter tests
    - determine supported nodejs environments
    - list required polyfills
    - .npmignore
        - should published thing contain readme, license, tests?

- inspiration
    - http://package.elm-lang.org/packages/NoRedInk/elm-decode-pipeline/latest
    - https://guide.elm-lang.org/interop/json.html
    - http://package.elm-lang.org/packages/elm-lang/core/latest/Json-Decode

- benchmarks?
- readme stuff
    - done with test driven development
    - data checking should probably be O(N)

- update package.json
    - inspiration https://github.com/sindresorhus/clipboard-cli/blob/master/package.json
