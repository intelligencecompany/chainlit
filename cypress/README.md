# Cypress-based E2E tests

## Running
### The lot of 'em
```sh
pnpm test
```

### Just one
```sh
SINGLE_TEST=password_auth pnpm test
```

### Headed/debugging
Causes the Electron browser to be shown on screen and keeps it open after tests are done.
Extremely useful for debugging!

```sh
SINGLE_TEST=password_auth CYPRESS_OPTIONS='--headed --no-exit' pnpm test
```

