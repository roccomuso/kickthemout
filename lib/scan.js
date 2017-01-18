const nodeARP = require('node-arp')
const getmac = require('getmac')

module.exports = function(myIP, cb) {
  var LAN = myIP.substr(0, myIP.lastIndexOf('.'))
  var result = []
  var count = 0
  for (var i = 1; i <= 255; i++) {
      var ip = LAN + '.' + i
      ;(function(ip) {
          // Ping Sweep
          nodeARP.getMAC(ip, function(err, mac) {
              if (!err && mac) {
                if (getmac.isMac(mac))
                      result.push({ip: ip, mac: mac})
              }
              if ((++count) > 254) cb(null, result)
          });
      })(ip)
  }
}
