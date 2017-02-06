# json-decode

## TODO

- features
    - what should it do when decoding fails?
        - probably do not throw but return error message
        - if everything is ok, return decoded object?
        - `{ ok: true, data: { ... }, errors: [ ... ] }
        - add tests agains faulure states
    - optional types - if present check against type, if not use default
        - determine syntax
    - should we have validation funcitons??
    - decode weirdly shaped data
        - tuples
            - [[true, 1, 5], [true, 10, 10]]
    - in tests - check if correct error types are thrown
    - should we JSON.decode the response or not?
    - write more tests
    - global flag to make everything optional/or everything mandatory
    - union types - eg Number or null, User or Admin
        - possible names `oneof`, `typeUnion`, `unionType`
    - validation function - x => x.length > 0
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
