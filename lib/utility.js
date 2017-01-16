const os = require('os')
const figlet = require('figlet')
var chalk = require('chalk')

exports.isRoot = function(){
  return process.getuid && process.getuid() === 0
}

exports.getInterfaces = function(){
  return Object.keys(os.networkInterfaces()).map(function(k){return k})
}

exports.getIP = function(interface){
  return os.networkInterfaces()[interface][0].address
}

exports.printLogo = function(cb){
  figlet('KickThemOut', function(err, data) {
	  if (err) {
	    console.log('Something went wrong...');
	    console.dir(err);
	    return;
	  }
	  cb(chalk.magenta(data)); // then print logo con console
	})
}
