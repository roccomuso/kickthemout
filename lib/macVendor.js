const oui = require('oui')
const Spinner = require('cli-spinner').Spinner
const chalk = require('chalk')

exports.ouiUpdate = function(cb){
  const spinner = new Spinner(' Updating MAC Vendors DB.. %s');
  spinner.setSpinnerString('|/-\\')
  spinner.start()

  oui.update(function(err){
    spinner.stop()
    if (err) return cb(err)
    cb(null, chalk.green(' \u2713 MAC Vendors DB updated!'))
  })

}

exports.get = function(mac){
  if (Array.isArray(mac)){
    return mac.map(function(host){
      host.vendor = getVendorName(host.mac_address)
      return host
    })
  }else {
    return getVendorName(mac)
  }

}

function getVendorName(mac){
  var vendor = oui(mac)
  return vendor ? vendor.split('\n')[0] : 'Not found'
}

exports.oui = oui
