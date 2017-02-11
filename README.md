# json-decode

## TODO

- features
    - cleanup error messages
        - grammarly
    - consider putting decoder validation at the top
        - probably not but we could put the 600 unreachable error at the top
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
    - introduce any type for really weird data
        - all checks just would be skipped
        - syntax
            { key: jd.any }
            { key: "any" }
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

- update package.json
    - inspiration https://github.com/sindresorhus/clipboard-cli/blob/master/package.json
