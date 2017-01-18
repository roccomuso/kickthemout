const debug = require('debug')('kickthemout')
const _ = require('lodash')
const async = require('async')
const chalk = require('chalk')
const inquirer = require('inquirer')
const latestVersion = require('latest-version')
const pkg = require('./package.json')
const isRoot = require('./lib/utility').isRoot
const printLogoAndCredits = require('./lib/utility').printLogoAndCredits
const vendors = require('./lib/vendors')
const Attack = require('./lib/Attack')
const Network = require('./lib/Network')
const Inquiries = require('./lib/Inquiries')
const Spinner = require('cli-spinner').Spinner
const arp = require('arpjs')

debug('Debug enabled.')

const network = new Network()
const ask = new Inquiries()

async.waterfall([
    function(callback) {
      debug('Printing logo and credits')
      printLogoAndCredits(function(ascii){
        console.log(ascii)
        callback(null)
      })
    },
    function(callback) {
      // root permission required
      if (!isRoot()) {
        callback('root permission required')
      }else{
        console.log(chalk.green(' \u2713 Running as', chalk.blue('root\n')))
        callback(null)
      }
    },
    function(callback){
      debug('Checks for available update..')
      latestVersion(pkg.name).then(function(version){
        debug('Current version:', pkg.version, '- Latest version:', version)
        if (require('semver').lt(pkg.version, version)) console.log('  Update available '+chalk.gray(pkg.version)+' → '+chalk.green(version)+'\n')
        callback(null)
      }).catch(callback)
    },
    function(callback){
      // starting questions
      ask.whatToDo(callback)
    },
    function(callback) {
      // get Interfaces
      network.getInterfaces(callback)
    },
    function(ifaces, callback) {
      // select Interface
      ask.selectInterface(ifaces, function(err, iface){
        if (err) return callback(err)
        network.selectInterface(iface)
        callback(null)
      })
    },
    function(callback) {
      // host discovery
      var iface = network.iface
      var myIP = iface.ip_address

      var spinner = new Spinner('  Scanning LAN.. %s');
      spinner.setSpinnerString('|/-\\')
      spinner.start()
      network.scan(myIP, function(hosts){
        debug('hosts found:', hosts)
        if (!hosts.length) return callback('No hosts found!')
        spinner.stop()
        // adding iface mac
        network.iface.gateway_mac_address = (_.find(hosts, {'ip': iface.gateway_ip})).mac
        // removing ourself and the iface ip from targetHosts.
        _.remove(network.hosts, function(host){ return host.ip === myIP || host.ip === iface.gateway_ip})
        // getting target hosts' vendors (new prop. vendor)
        network.resolveVendors()
        callback(null)
      })

    },
    function(callback){
      arp.table(function(err, table){
        // now refreshed by Ping sweep
        if (err) debug(err)
        debug('Local ARP Table:', table)
        callback(null)
      })
    },
    function(callback){
      var hosts = network.hosts
      var iface = network.iface
      console.log(chalk.blue(chalk.green(' \u2713'),'Gateway',chalk.yellow(iface.gateway_ip),'has',chalk.green(hosts.length),'hosts up\n'))
      // attack options
      inquirer.prompt([{
        type: 'list',
        name: 'attackOption',
        message: 'Choose an option:',
        choices: [
          {name: 'Kick ONE off', value: 'one'},
          {name: 'Kick SOME off', value: 'some'},
          {name: 'Kick ALL off', value: 'all'},
          new inquirer.Separator(),
          {name: 'Exit KickThemOut\n', value: 'exit'},
        ]
      }]).then(function (answers) {
        debug('Selected option:', answers.attackOption)
        callback(null, hosts, iface, answers.attackOption)
      })
    },
    function(hosts, iface, attackOption, callback){
      if (attackOption === 'exit') process.exit(0)

      /*
      // TODO

      if (attackOption === 'one' || attackOption === 'all'){

      }
      var attack = new Attack()
      attack.setInterface(iface)
            .setTarget(hosts)
            .start()

      // TODO
      inquirer.prompt([{
        type: 'list',
        name: 'targetHosts',
        message: 'Select target hosts:',
        choices: []
      }]).then(function (answers) {
        debug('Selected hosts:', answers.targetHosts)
        callback(null, hosts, iface, answers.targetHosts)
      })
      */


    }
],
// final result callback
function(err, results) {
  console.log(chalk.red('Error: '+err))
  debug('Async final results:', results)
    // results is now equal to ['one', 'two']
});

/*

setInterval(function(){
  arp.poison('192.168.0.100', '192.168.0.1')
}, 6 * 1000)

*/
