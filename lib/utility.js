const os = require('os')
const figlet = require('figlet')
const chalk = require('chalk')
const network = require('network')

exports.isRoot = function(){
  return process.getuid && process.getuid() === 0
}

exports.getInterfaces = function(cb){
  network.get_interfaces_list(function(err, interfaces) {
    if (err) return cb(err)
    network.get_active_interface(function(err, activeInterface){
      if (err) return cb(err)
      cb(null, interfaces, activeInterface)
    })
  })
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
