'use strict'
const debug = require('debug')('kickthemout:Network')
const network = require('network')
const nodeARP = require('node-arp')
const getmac = require('getmac')
const oui = require('oui')

/*
* Class containing network related functions
*/

class Network {
  getInterfaces () {
    return new Promise((resolve, reject) => {
      network.get_interfaces_list((err, ifaces) => {
        if (err) return reject(err)
        debug('Getting available interfaces', ifaces)
        if (ifaces.length === 0) return reject(new Error('No network interfaces available'))
        this.availableInterfaces = ifaces
        resolve(ifaces)
      })
    })
  }

  selectInterface (iface) {
    this.iface = iface
  }

  scan (myIP) {
    debug('Starting host discovery in LAN')
    const LAN = myIP.substring(0, myIP.lastIndexOf('.'))

    const lookups = Array.from({length: 254}, (_, idx) => {
      const ip = `${LAN}.${idx + 1}`
      return new Promise((resolve) => {
        // Ping Sweep
        nodeARP.getMAC(ip, (err, mac) => {
          if (!err && mac && getmac.isMac(mac)) {
            return resolve({ip, mac})
          }
          resolve(null)
        })
      })
    })

    return Promise.all(lookups).then((results) => {
      this.hosts = results.filter(Boolean)
      return this.hosts
    })
  }

  resolveVendors () {
    // populate a new field 'vendor' for each host
    this.hosts = this.hosts.map((host) => {
      debug('getting vendor for:', host)
      host.vendor = _getVendorName(host.mac)
      return host
    })
  }
}

/* Private */

function _getVendorName (mac) {
  const vendor = oui(mac)
  return vendor ? vendor.split('\n')[0] : 'Vendor unknown'
}

module.exports = Network
