const debug = require('debug')('kickthemout')
const prompt = require('prompt')
const async = require('async')
const chalk = require('chalk')
const isRoot = require('./lib/utility').isRoot
const getInterfaces = require('./lib/utility').getInterfaces
const printLogo = require('./lib/utility').printLogo
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
    function(callback) {
      debug('Getting available interfaces')
      var interfaces = getInterfaces()
      var table = new Table()
      table.push.apply(this, interfaces.map(function(val, i){
        var a = {}
        a[i]=val
        return a}))
      console.log(table.toString())
      callback(null, interfaces)
    },
    function(interfaces, callback) {
      prompt.start()
      prompt.get([{name: 'interface', type: 'string', required: true, enum: interfaces, description: 'Select the network Interface'}], function (err, result) {
        debug('prompted value:', result)
        if (err) return console.log(err)
        arp.setInterface(result)
        callback(null)
      })
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
