# json-decode

## TODO

- features
    - what should it do when decoding fails?
        {
            error: null
            error: {
                value: { a: 1, b: [{c: 1}] },
                decoder: { a: Number, b: [{c: Boolean}]},
                currentDecodedValue: 1,
                currentDecoder: Boolean,
                path: {
                    value: {b: [{c: 1}]},
                    decoder: {b: [{c: Boolean}]},
                    string: "wholeDecodedValue.b[0].c"
                }
                message: "Decoding failed at "wholeDecodedValue.b[0].c", value "1", decoder "Boolean"."
            }
            // data enhanced with defaults
            data: { a: 1, b: [{c: 1}] }
        }
        - add tests agains faulure states
    - optional types
        - optional types - if present check against type, if not use default
        - should optional type be used when value is
            - missing - yes
            - null - maybe
            - undefined - maybe
        - add to the return type
            // list of paths where defaults were applied
            defaults: [
                "wholeDecodedValue.b[0].c",
                "wholeDecodedValue.b[1].c",
                "wholeDecodedValue.b[2].c",
                "wholeDecodedValue.b[3].c",
            ]
    - tuples
        - ["Ok", 1, 1]
        - {tuple: [String, Number, Number]}
    - union types
        - possible names `oneof`, `typeUnion`, `unionType`
        - [null, 1, null, 10, 10]
        - {unionType: [Number, null]}
    - in tests - check if correct error types are thrown
    - write more tests
    - global flag to make everything optional/or everything mandatory
    - nullable: true flag?
        - { type: Number, nullable: true } - means it could be Number or null
        - is this really better than { unionType: [Number, null] }
        - probably not

- inspiration
    - http://package.elm-lang.org/packages/NoRedInk/elm-decode-pipeline/latest
    - https://guide.elm-lang.org/interop/json.html
    - http://package.elm-lang.org/packages/elm-lang/core/latest/Json-Decode

- do not import the whole lodash?
- benchmarks?
- readme stuff
    - done with test driven development
    - data checking should probably be O(N)
