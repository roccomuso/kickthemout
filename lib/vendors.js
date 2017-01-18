const oui = require('oui')
const Spinner = require('cli-spinner').Spinner
const chalk = require('chalk')

// MAC Vendors (OUI = Organizations Unique identifier)

exports.ouiUpdate = function(cb){
  console.log(chalk.orange('  This task could take up to 10/15 minutes...'))
  const spinner = new Spinner('  Updating MAC Vendors DB.. %s');
  spinner.setSpinnerString('|/-\\')
  spinner.start()

  oui.update(function(err){
    spinner.stop()
    if (err) return cb(err)
    cb(null, chalk.green('\n \u2713 MAC Vendors DB updated!'))
  })

}

exports.oui = oui
