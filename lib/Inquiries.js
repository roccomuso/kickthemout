'use strict'
const debug = require('debug')('kickthemout:Inquiries')
const inquirer = require('inquirer')
const vendors = require('./vendors')
const chalk = require('chalk')

/*
* Inquiries Class
*/

class Inquiries {

  // constructor () {}

  whatToDo (callback) {
    inquirer.prompt([{
      type: 'list',
      name: 'choice',
      message: 'What to do?',
      choices: ['Start KickThemOut',
        new inquirer.Separator(),
      {name: 'Update MAC Vendors DB', value: 'oui'}]
    }]).then(function (answers) {
      debug('Choice:', answers.choice)
      if (answers.choice === 'oui') {
        // update oui DB file from IEEE
        vendors.ouiUpdate(function (err, mex) {
          if (err) return callback(err)
          console.log(mex)
          process.exit(0)
        })
      } else {
        callback(null)
      }
    })
  }

  selectInterface (ifaces, callback) {
    var interfaces = ifaces.map(function (i) { return {name: i.name, value: i} })
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

  attackOption (hosts, callback) {
    inquirer.prompt([{
      type: 'list',
      name: 'attackOption',
      message: 'Choose an option:',
      choices: [
        {name: 'Kick SOME off', value: 'some'},
        {name: 'Kick ALL off', value: 'all'},
        new inquirer.Separator(),
        {name: 'Exit KickThemOut\n', value: 'exit'}
      ]
    }]).then(function (answers) {
      debug('Selected option:', answers.attackOption)
      if (answers.attackOption === 'exit') process.exit(0)
      if (answers.attackOption === 'some') {
        // hosts selection
        inquirer.prompt([
          {
            type: 'checkbox',
            message: 'Select target Hosts',
            name: 'targets',
            choices: hosts.map(function (host) {
              return {name: host.ip + ' [' + host.vendor + ']', value: host.ip}
            }),
            validate: function (answer) {
              if (answer.length < 1) {
                return 'You must choose at least one target.'
              }
              return true
            }
          }
        ]).then(function (answers) {
          debug('Selected target hosts:', answers.targets)
          callback(null, answers.targets)
        })
      } else {
        // Selected 'all' hosts
        var allHosts = hosts.map(function (host) { return host.ip })
        debug('Attacking all the hosts:', allHosts)
        callback(null, allHosts)
      }
    })
  }

  nextStep (attack, askFor) {
    var self = this
    console.log('\n')
    inquirer.prompt([
      {
        type: 'list',
        message: 'Choose:',
        name: 'nextStep',
        choices: [
          askFor==='pause' ? {name: 'Pause the attack', value: 'pause'} : {name: 'Resume the attack', value: 'resume'},
          new inquirer.Separator(),
          {name: 'Stop and Exit\n', value: 'exit'}
        ]
      }
    ]).then(function (answers) {
      debug('Next step:', answers.nextStep)
      if (answers.nextStep === 'exit') process.exit(0)
      if (answers.nextStep === 'pause'){
        attack.stop()
        console.log(chalk.green('\n  \u2713', chalk.blue('Attack'), chalk.yellow('paused')))
        self.nextStep(attack, 'resume')
      }else{
        attack.start()
        console.log(chalk.green('\n  \u2713', chalk.blue('Attack'), 'resumed'))
        self.nextStep(attack, 'pause')
      }
    })
  }

}

module.exports = Inquiries
