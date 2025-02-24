# glab-toolkit

<a href="https://www.npmjs.com/package/glab-toolkit" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/v/glab-toolkit" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/glab-toolkit" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/dt/glab-toolkit" alt="NPM Downloads" /></a>
<a href="https://github.com/alexzhang1030/glab-toolkit/blob/main/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/github/license/alexzhang1030/glab-toolkit" alt="License" /></a>

Gitlab toolkit CLI

Mostly code inspired by [changesets-gitlab](https://github.com/un-ts/changesets-gitlab), kudos to the author!

## Installation

```bash
pnpm i glab-toolkit
```

## Environment Variables

General:

- `GITLAB_TOKEN` - Gitlab token (required)
- `GITLAB_HOST` - Gitlab host (required)

for `glab-toolkit exec`

- `INPUT_COMMAND` - Command to execute (required)
- `INPUT_BRANCH` - Branch to execute the command on (required)
- `INPUT_TITLE` - Title of the merge request (required)
- `INPUT_TARGET_BRANCH` - Target branch of the merge request (default `CI_REF_NAME`)
- `INPUT_REMOVE_SOURCE_BRANCH` - Remove source branch after merge (default `false`)
- `INPUT_LABELS` - Labels of the merge request (default `[]`)
- `INPUT_COMMIT_MESSAGE` - Commit message of the merge request (default `chore: update`)
- `INPUT_DESCRIPTION` - Description of the merge request (default `''`)

## License

MIT
