# json-decode

## TODO

- features
    - optional types
        - optional types - if present check against type, if not use default
        // nullable
        Nuber
            1 -> 1
            null -> null
            missing -> null
            'wrong' -> Error
        // non-nullable
        Nuber
            1 -> 1
            null -> Error
            missing -> Error
            'wrong' -> Error
        //
        { x: { type: Number, required: true } }
        {
            // if null or missing, 0
            // if Number ok
            // if other type error
            x: { type: Number, default: 0 }
        }
        - should optional type be used when value is
            - missing - yes
            - null - yes
            - undefined - yes
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
    - walk through the whole object to determine what is wrong?
        - return array of errors instead of one error?
    - tuples
        - ["Ok", 1, 1]
        - {tuple: [String, Number, Number]}
    - consider putting decoder validation at the top
        - currenty if we have
            - value "10"
            - decoder [Nonsens]
            - we detect type mismatch String<->Array but not invalid decoder because we are comparing one by one recursively and we did not get to the nested invalid decoder value yet
    - union types
        - possible names `oneof`, `typeUnion`, `unionType`
        - [null, 1, null, 10, 10]
        - {unionType: [Number, null]}
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

- when done
    - cleanup error codes
        - document error codes
    - browser build
        - regular
        - min
        - should work with require, import, window.jsonDecode
    - code coverage?

- docs
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

- inspiration
    - http://package.elm-lang.org/packages/NoRedInk/elm-decode-pipeline/latest
    - https://guide.elm-lang.org/interop/json.html
    - http://package.elm-lang.org/packages/elm-lang/core/latest/Json-Decode

- do not import the whole lodash?
- benchmarks?
- readme stuff
    - done with test driven development
    - data checking should probably be O(N)

- update package.json
    - inspiration https://github.com/sindresorhus/clipboard-cli/blob/master/package.json
