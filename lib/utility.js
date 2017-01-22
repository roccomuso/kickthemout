const debug = require('debug')('kickthemout:utility')
const figlet = require('figlet')
const chalk = require('chalk')
const currentVersion = require('../package.json').version
const latestVersion = require('latest-version')
const pkg = require('../package.json')

exports.isRoot = function () {
  return process.getuid && process.getuid() === 0
}

exports.printLogoAndCredits = function (cb) {
  figlet('KickThemOut', function (err, logo) {
    if (err) {
      console.log('Something went wrong...')
      console.dir(err)
      return
    }
    var credits = chalk.yellow('     === Kick Devices off your LAN (' + chalk.red('KickThemOut v' + currentVersion) + ') ===\n') + chalk.yellow('     === Made with', chalk.red('\u2764'), 'by', chalk.blue('Rocco Musolino'), '(roccomuso) ===')
    cb(chalk.magenta(logo) + '\n' + credits + '\n\n') // then print logo con console
  })
}

exports.isOnline = function (cb) {
  require('dns').lookup('google.com', function (err) {
    if (err && err.code === 'ENOTFOUND') {
      cb(false)
    } else {
      cb(true)
    }
  })
}

exports.checkForUpdate = function (callback) {
  exports.isOnline(function (isOnline) {
    if (isOnline) {
      debug('Internet connection ok')
      console.log(chalk.green('  \u2713 Internet connection.\n'))
      latestVersion(pkg.name).then(function (version) {
        debug('Current version:', pkg.version, '- Latest version:', version)
        if (require('semver').lt(pkg.version, version)) console.log('  Update available ' + chalk.gray(pkg.version) + ' → ' + chalk.green(version) + '\n')
        callback(null)
      }).catch(callback)
    } else {
      // bypass version control
      debug('Bypassing version control, we are offline.')
      console.log(chalk.gray(chalk.red('  \u274C'), 'no internet connection'))
      callback(null)
    }
  })
}
