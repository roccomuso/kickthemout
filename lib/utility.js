'use strict'
const dns = require('dns')
const debug = require('debug')('kickthemout:utility')
const figlet = require('figlet')
const chalk = require('chalk')
const semver = require('semver')
const latestVersion = require('latest-version')
const pkg = require('../package.json')

exports.isRoot = function () {
  return process.getuid && process.getuid() === 0
}

exports.printLogoAndCredits = async function () {
  const logo = await figlet('KickThemOut')
  const credits = chalk.yellow(`     === Kick Devices off your LAN (${chalk.red('KickThemOut v' + pkg.version)}) ===\n`) +
    chalk.yellow('     === Made with', chalk.red('❤'), 'by', chalk.blue('Rocco Musolino'), '(roccomuso) ===')
  return chalk.magenta(logo) + '\n' + credits + '\n\n'
}

exports.isOnline = function () {
  return new Promise((resolve) => {
    dns.lookup('google.com', (err) => {
      resolve(!(err && err.code === 'ENOTFOUND'))
    })
  })
}

exports.checkForUpdate = async function () {
  const online = await exports.isOnline()
  if (!online) {
    // bypass version control
    debug('Bypassing version control, we are offline.')
    console.log(chalk.gray(chalk.red('  ❌'), 'no internet connection'))
    return
  }

  debug('Internet connection ok')
  console.log(chalk.green('  ✓ Internet connection.\n'))
  const version = await latestVersion(pkg.name)
  debug('Current version:', pkg.version, '- Latest version:', version)
  if (semver.lt(pkg.version, version)) {
    console.log(`  Update available ${chalk.gray(pkg.version)} → ${chalk.green(version)}\n`)
  }
}
