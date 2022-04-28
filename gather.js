const fse = require('fs-extra')
const meadows = require('./valley/meadows.js')
const copy = require('recursive-copy')
const exec = require("exec-sh").promise;
const { promiser, fixInstalledPath, fixSourceControlPath, logNoSuchFile, buildCopyOptions } = require('./common')

const promises = promiser()
const copyOptions = {
  dot: true,
  overwrite: true,
  expand: true,
  filter: function (e) {
    return !(e.includes('node_modules'))
  }
}

fse.ensureDirSync('./valley/meadows')
const paths = fse.readdirSync('./valley/meadows')
// Make Async
paths
  .filter((path) => path !== '.git')
  .forEach((path) => fse.removeSync(`./valley/meadows/${path}`))

meadows.forEach((meadow) => {
  promises.newStep()
  if (Array.isArray(meadow)) {
    meadow.forEach(interpretMeadow)
  } else {
    interpretMeadow(meadow)
  }
})

function interpretMeadow(meadow) {
  if (meadow.run) {
    promises.addToStep(async () => {
      if (meadow.if && typeof meadow.if === "string") {
        try {
          await exec(meadow.if)
          exec(meadow.run)
        } catch (e) {
          console.log(`Skipping step \`${meadow.run}\``)
          if (e.stdout) console.warn(e.stdout)
          if (e.stderr) console.warn(e.stderr)
        }
      } else {
        if (meadow.if() === true) {
          exec(meadow.run)
        } else {
          console.log(`Skipping step \`${meadow.run}\``)
        }
      }
    })
  } else if (meadow.path) {
    promises.addToStep(() => copy(
      fixInstalledPath(meadow.path),
      fixSourceControlPath(meadow.path),
      buildCopyOptions(copyOptions, meadow)
    )
      .then((...args) => console.log(args, `Copied '${fixInstalledPath(meadow.path)}' to '${fixSourceControlPath(meadow.path)}'`))
      .catch(logNoSuchFile))
  }
}

promises.run()
  .then(() => console.log('Done gathering.'))
  .catch((err) => console.error('Error while gathering:', err))
