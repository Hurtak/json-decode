# json-decode

## TODO

- features
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
