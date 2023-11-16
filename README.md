# NPM Audit JUnit

A tool to parse the result of `npm outdated --json` to a JUnit XML for gitlab reporting.

## Usage

Add to you npm scripts:

```json
{
  "scripts": {
    "ci:outdated": "npm outdated --json | npx npm-outdated-junit > npm-outdated.junit.xml"
  }
}
```

## Docs

- [JUnit XML format](https://www.ibm.com/docs/en/developer-for-zos/14.1?topic=formats-junit-xml-format)
- [Gitlab JUnit parser info](https://gitlab.com/gitlab-org/gitlab/-/issues/299086)
