#!/usr/bin/env node
'use strict'

const debug = require('debug')('kickthemout:flow')
const chalk = require('chalk')
const Spinner = require('cli-spinner').Spinner
const { checkForUpdate, isRoot, printLogoAndCredits } = require('./lib/utility')
const Attack = require('./lib/Attack')
const Network = require('./lib/Network')
const Inquiries = require('./lib/Inquiries')

debug('Debug enabled.')

const network = new Network()
const ask = new Inquiries()

async function main () {
  debug('Printing logo and credits')
  console.log(await printLogoAndCredits())

  // root permission required
  if (!isRoot()) throw new Error('root permission required')
  console.log(chalk.green('  ✓ Running as', chalk.bold('root')))

  debug('Checks for available update..')
  await checkForUpdate()

  // starting questions
  await ask.whatToDo()

  // get Interfaces
  const ifaces = await network.getInterfaces()

  // select Interface
  const iface = await ask.selectInterface(ifaces)
  network.selectInterface(iface)

  // host discovery
  const myIP = iface.ip_address

  const spinner = new Spinner('  Scanning LAN.. %s')
  spinner.setSpinnerString('|/-\\')
  spinner.start()

  const hosts = await network.scan(myIP)
  debug('hosts found:', hosts)
  if (!hosts.length) throw new Error('No hosts found!')
  spinner.stop()

  // adding iface mac (if found)
  const gateway = hosts.find((host) => host.ip === iface.gateway_ip)
  network.iface.gateway_mac_address = gateway ? gateway.mac : 'Not found'
  // removing ourself and the iface ip from targetHosts.
  network.hosts = network.hosts.filter((host) => host.ip !== myIP && host.ip !== iface.gateway_ip)
  // getting target hosts' vendors (new prop. vendor)
  network.resolveVendors()

  console.log(chalk.blue(chalk.green('\n  ✓'), 'Gateway', chalk.yellow(network.iface.gateway_ip), 'has', chalk.green(network.hosts.length), 'hosts up\n'))

  // attack options
  const targets = await ask.attackOption(network.hosts)

  // starting attack
  const attack = new Attack()
  attack.setInterface(network.iface)
    .setTarget(targets)
    .start()
  console.log(chalk.green('  ✓'), chalk.blue('Attack running...'))
  await ask.nextStep(attack, 'pause')
}

main().catch((err) => {
  console.log(chalk.red('Error: ' + (err && (err.message || err))))
  debug('Fatal error:', err)
  process.exit(1)
})
