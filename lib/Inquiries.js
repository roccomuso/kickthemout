const debug = require('debug')('kickthemout')
const inquirer = require('inquirer')
const vendors = require('./lib/vendors')

/*
* Inquiries Class
*/

class Inquiries {

  constructor () {}

  whatToDo (callback) {
    inquirer.prompt([{
      type: 'list',
      name: 'choice',
      message: 'What to do?',
      choices: ['Start KickThemOut',
      {name: 'Start KickThemOut [Debug mode]', value: 'debug'},
      new inquirer.Separator(),
      {name: 'Update MAC Vendors DB', value: 'oui'}]
    }]).then(function (answers) {
      debug('Choice:', answers.choice);
      if (answers.choice === 'oui'){
        // update oui DB file from IEEE
        vendors.ouiUpdate(function(err, mex){
          if (err) return callback(err)
          console.log(mex)
          process.exit(0)
        })
      }else if(answers.choice === 'debug'){
        // TODO: dinamycally enable debug mode
        // ...
        callback(null)
      }else {
        callback(null)
      }
    })
  }

  selectInterface (ifaces, callback) {
    var interfaces = ifaces.map(function(i){return {name: i.name, value: i}})
    interfaces.push(new inquirer.Separator('\n'))
    inquirer.prompt([{
      type: 'list',
      name: 'iface',
      message: 'Select the network Interface:',
      choices: interfaces
    }]).then(function (answers) {
      debug('Selected interface:', answers.iface)
      callback(null, answers.iface)
    })
  }

}

module.exports = Inquiries
