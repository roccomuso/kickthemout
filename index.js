#!/usr/bin/env node
'use strict'

const debug = require('debug')('kickthemout:flow')
const _ = require('lodash')
const async = require('async')
const chalk = require('chalk')
const checkForUpdate = require('./lib/utility').checkForUpdate
const isRoot = require('./lib/utility').isRoot
const printLogoAndCredits = require('./lib/utility').printLogoAndCredits
const Attack = require('./lib/Attack')
const Network = require('./lib/Network')
const Inquiries = require('./lib/Inquiries')
const Spinner = require('cli-spinner').Spinner

debug('Debug enabled.')

const network = new Network()
const ask = new Inquiries()

async.waterfall([
  function (callback) {
    debug('Printing logo and credits')
    printLogoAndCredits(function (ascii) {
      console.log(ascii)
      callback(null)
    })
  },
  function (callback) {
      // root permission required
    if (!isRoot()) {
      callback('root permission required')
    } else {
      console.log(chalk.green('  \u2713 Running as', chalk.bold('root')))
      callback(null)
    }
  },
  function (callback) {
    debug('Checks for available update..')
    checkForUpdate(callback)
  },
  function (callback) {
      // starting questions
    ask.whatToDo(callback)
  },
  function (callback) {
      // get Interfaces
    network.getInterfaces(callback)
  },
  function (ifaces, callback) {
      // select Interface
    ask.selectInterface(ifaces, function (err, iface) {
      if (err) return callback(err)
      network.selectInterface(iface)
      callback(null)
    })
  },
  function (callback) {
      // host discovery
    var iface = network.iface
    var myIP = iface.ip_address

    var spinner = new Spinner('  Scanning LAN.. %s')
    spinner.setSpinnerString('|/-\\')
    spinner.start()
    network.scan(myIP, function (hosts) {
      debug('hosts found:', hosts)
      if (!hosts.length) return callback('No hosts found!')
      spinner.stop()
        // adding iface mac
      network.iface.gateway_mac_address = (_.find(hosts, {'ip': iface.gateway_ip})).mac
        // removing ourself and the iface ip from targetHosts.
      _.remove(network.hosts, function (host) { return host.ip === myIP || host.ip === iface.gateway_ip })
        // getting target hosts' vendors (new prop. vendor)
      network.resolveVendors()
      callback(null)
    })
  },
    /*
    function(callback){
      require('arpjs').table(function(err, table){
        // now refreshed by Ping sweep
        if (err) debug(err)
        debug('Local ARP Table:', table)
        callback(null)
      })
    },
    */
  function (callback) {
    console.log(chalk.blue(chalk.green('\n  \u2713'), 'Gateway', chalk.yellow(network.iface.gateway_ip), 'has', chalk.green(network.hosts.length), 'hosts up\n'))
      // attack options
    ask.attackOption(network.hosts, callback)
  },
  function (targets) {
    // starting attack
    var attack = new Attack()
    attack.setInterface(network.iface)
            .setTarget(targets)
            .start()
    console.log(chalk.green('  \u2713'), chalk.blue('Attack running...'))
    ask.nextStep(attack, 'pause')
  }
],
// final result callback
function (err, results) {
  // Never reached
  console.log(chalk.red('Error: ' + err))
  debug('Async final results:', results)
})
