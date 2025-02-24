import { defineCommand, runMain } from 'citty'
import { description, name, version } from '../package.json'
import { execCommand } from './commands'

const main = defineCommand({
  meta: {
    name,
    description,
    version,
  },
  subCommands: {
    exec: execCommand,
  },
})

runMain(main)
