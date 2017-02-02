# json-decode

- done with test driven development

## TODO

- should we have validation funcitons??
- should we JSON.decode the response or not?
- what should it do when decoding fails?
    - probably do not throw but return error message
    - if everything is ok, return decoded object?
    ```
        {
            ok: true,
            data: { ... },
            errors: [

            ]
        }
    ```
