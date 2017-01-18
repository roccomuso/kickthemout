const debug = require('debug')('kickthemout')
const arp = require('arpjs')

class Attack {

  constructor () {}

  setInterface (iface) {
    this.iface = iface
    debug('Selecting interface for ARP Spoofing:', this.iface.name)
    arp.setInterface(this.iface.name)
    return this // for method chaining
  }

  setTarget (hosts) {
    this.targets = hosts
    return this // for method chaining
  }

  start () {
    if (!this.targets) throw new Error('No target acquired.')

  }

}

module.exports = Attack
