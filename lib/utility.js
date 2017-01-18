const figlet = require('figlet')
const chalk = require('chalk')
const network = require('network')
const currentVersion = require('../package.json').version

exports.isRoot = function(){
  return process.getuid && process.getuid() === 0
}

exports.getInterfaces = function(cb){
  network.get_interfaces_list(function(err, interfaces) {
    if (err) return cb(err)
    cb(null, interfaces)
  })
}

exports.printLogoAndCredits = function(cb){
  figlet('KickThemOut', function(err, logo) {
	  if (err) {
	    console.log('Something went wrong...');
	    console.dir(err);
	    return;
	  }
    var credits = chalk.yellow('     === Kick Devices off your LAN ('+chalk.red('KickThemOut v'+currentVersion)+') ===\n')+chalk.yellow('     === Made with',chalk.red('\u2764'),'by',chalk.blue('Rocco Musolino'),'(roccomuso) ===')
	  cb(chalk.magenta(logo)+'\n'+credits+'\n\n'); // then print logo con console
	})
}
