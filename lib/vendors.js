'use strict'
const oui = require('oui')
const Spinner = require('cli-spinner').Spinner
const chalk = require('chalk')

// MAC Vendors (OUI = Organizations Unique Identifier)

exports.ouiUpdate = function () {
  console.log(chalk.yellow('  This task could take up to 5 minutes...'))
  const spinner = new Spinner('  Updating MAC Vendors DB.. %s')
  spinner.setSpinnerString('|/-\\')
  spinner.start()

  return new Promise((resolve, reject) => {
    oui.update({}, (err) => {
      spinner.stop()
      if (err) return reject(err)
      resolve(chalk.green('\n ✓ MAC Vendors DB updated!'))
    })
  })
}

exports.oui = oui
