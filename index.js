const debug = require('debug')('kickthemout')
const async = require('async')
const chalk = require('chalk')
const inquirer = require('inquirer')
const isRoot = require('./lib/utility').isRoot
const getInterfaces = require('./lib/utility').getInterfaces
const printLogo = require('./lib/utility').printLogo
const getIP = require('./lib/utility').getIP
const Spinner = require('cli-spinner').Spinner
const scan = require('./lib/scan')
const arp = require('arpjs')

debug('Debug enabled.')

async.waterfall([
    function(callback) {
      debug('Printing logo')
      printLogo(function(logo){
        console.log(logo)
        callback(null)
      })
    },
    function(callback) {
      debug('Running as root?', isRoot())
      if (!isRoot()) {
        callback('root permission required')
      }else{
        callback(null)
      }
    },
    function(callback){
      arp.table(function(err, table){
        if (err) debug(err)
        debug('Local ARP Table:', table)
        callback(null)
      })
    },
    function(callback) {
      getInterfaces(function(err, ifaces, activeIface){
        if (err) return callback(err)
        debug('Getting available interfaces', ifaces)
        if (ifaces.length === 0) return callback('No network interfaces available')
        inquirer.prompt([{
          type: 'list',
          name: 'networkInterface',
          message: 'Select the network interface:',
          choices: ifaces.map(function(i){return {name: i.name, disabled: (i.name === activeIface.name) ? false : 'Not active' }})
        }]).then(function (answers) {
          debug('Selected interface:', answers.networkInterface);
          callback(null, activeIface)
        })
      })
    },
    function(iface, callback) {
      debug('Setting ARP interface:', iface)
      arp.setInterface(iface.name)

      var gw = iface.gateway_ip
      var myIP = iface.ip_address

      // host discovery
      debug('Starting host discovery in LAN')
      var spinner = new Spinner(' Scanning LAN.. %s');
      spinner.setSpinnerString('|/-\\')
      spinner.start()
      scan(myIP, function(err, hosts){
        if (err) return callback('Scan error '+ err.toString())
        debug('hosts found:', hosts)
        spinner.stop()
        callback(null, hosts, gw)
      })

    },
    function(hosts, gw, callback){
      console.log(chalk.blue(chalk.green(' \u2713'),'Gateway',chalk.yellow(gw),'has',chalk.green(hosts.length),'hosts up'))
      // TODO

    }
],
// final result callback
function(err, results) {
  console.log(chalk.red('Error: '+err))
  debug('Async final results:', results)
    // results is now equal to ['one', 'two']
});

/*
arp.setInterface('wlp2s0')

arp.table(function(err, table){
  console.log(table)
})

setInterval(function(){
  arp.poison('192.168.0.100', '192.168.0.1')
}, 6 * 1000)

*/
