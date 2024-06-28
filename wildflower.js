#!/usr/bin/env node

import { sow } from "./sow.js";
import { gather } from "./gather.js";
import { till } from "./till.js";

let command = process.argv[2]

if (command === 'sow') {
  await sow()
} else if (command === 'gather') {
  await gather()
} else if (command === 'till') {
  await till()
} else {
  if (!command) {
    console.error(`Error: Must provide a command: sow, gather, till`)
  } else {
    console.error(`Error: Unknown command '${command}'!`)
  }
}
