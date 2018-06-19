'use strict'
const debug = require('debug')('kickthemout:Network')
const network = require('network')
const nodeARP = require('node-arp')
const getmac = require('getmac')
const oui = require('oui')

/*
* Class containing network releated functions
*/

class Network {
  /*
  constructor () {
    this.availableInterfaces
    this.iface
    this.hosts
  }
  */

  getInterfaces (callback) {
    var self = this
    network.get_interfaces_list(function (err, ifaces) {
      if (err) return callback(err)
      debug('Getting available interfaces', ifaces)
      if (ifaces.length === 0) return callback(new Error('No network interfaces available'))
      self.availableInterfaces = ifaces
      callback(null, ifaces)
    })
  }

  selectInterface (iface) {
    this.iface = iface
  }

  scan (myIP, cb) {
    var self = this
    debug('Starting host discovery in LAN')
    var LAN = myIP.substr(0, myIP.lastIndexOf('.'))
    var result = []
    var count = 0
    for (var i = 1; i <= 255; i++) {
      var ip = LAN + '.' + i
        ;(function (ip) {
        // Ping Sweep
        nodeARP.getMAC(ip, function (err, mac) {
          if (!err && mac) {
            if (getmac.isMac(mac)) {
              result.push({ip: ip, mac: mac})
            }
          }
          if ((++count) > 254) {
            self.hosts = result
            cb(result)
          }
        })
      })(ip)
    }
  }

  resolveVendors () {
    // populate a new field 'vendor' for the hosts
    if (Array.isArray(this.hosts)) {
      this.hosts = this.hosts.map(function (host) {
        debug('getting vendor for:', host)
        host.vendor = _getVendorName(host.mac)
        return host
      })
    } else {
      return _getVendorName(this.hosts)
    }
  }
}

/* Private */

function _getVendorName (mac) {
  var vendor = oui(mac)
  return vendor ? vendor.split('\n')[0] : 'Vendor unknown'
}

module.exports = Network
