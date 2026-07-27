'use strict'
const debug = require('debug')('kickthemout:Inquiries')
const inquirer = require('inquirer')
const vendors = require('./vendors')
const chalk = require('chalk')

/*
* Inquiries Class
*/

class Inquiries {
  async whatToDo () {
    const answers = await inquirer.prompt([{
      type: 'list',
      name: 'choice',
      message: 'What to do?',
      choices: ['Start KickThemOut',
        new inquirer.Separator(),
        {name: 'Update MAC Vendors DB', value: 'oui'}]
    }])
    debug('Choice:', answers.choice)
    if (answers.choice === 'oui') {
      // update oui DB file from IEEE
      const message = await vendors.ouiUpdate()
      console.log(message)
      process.exit(0)
    }
  }

  async selectInterface (ifaces) {
    const interfaces = ifaces.map((i) => ({name: i.name, value: i}))
    interfaces.push(new inquirer.Separator('\n'))
    const answers = await inquirer.prompt([{
      type: 'list',
      name: 'iface',
      message: 'Select the network Interface:',
      choices: interfaces
    }])
    debug('Selected interface:', answers.iface)
    return answers.iface
  }

  async attackOption (hosts) {
    const answers = await inquirer.prompt([{
      type: 'list',
      name: 'attackOption',
      message: 'Choose an option:',
      choices: [
        {name: 'Kick SOME off', value: 'some'},
        {name: 'Kick ALL off', value: 'all'},
        new inquirer.Separator(),
        {name: 'Exit KickThemOut\n', value: 'exit'}
      ]
    }])
    debug('Selected option:', answers.attackOption)
    if (answers.attackOption === 'exit') process.exit(0)

    if (answers.attackOption === 'some') {
      // hosts selection
      const targetAnswers = await inquirer.prompt([
        {
          type: 'checkbox',
          message: 'Select target Hosts',
          name: 'targets',
          choices: hosts.map((host) => ({name: `${host.ip} [${host.vendor}]`, value: host.ip})),
          validate: (answer) => answer.length < 1 ? 'You must choose at least one target.' : true
        }
      ])
      debug('Selected target hosts:', targetAnswers.targets)
      return targetAnswers.targets
    }

    // Selected 'all' hosts
    const allHosts = hosts.map((host) => host.ip)
    debug('Attacking all the hosts:', allHosts)
    return allHosts
  }

  async nextStep (attack, askFor) {
    console.log('\n')
    const answers = await inquirer.prompt([
      {
        type: 'list',
        message: 'Choose:',
        name: 'nextStep',
        choices: [
          askFor === 'pause' ? {name: 'Pause the attack', value: 'pause'} : {name: 'Resume the attack', value: 'resume'},
          new inquirer.Separator(),
          {name: 'Stop and Exit\n', value: 'exit'}
        ]
      }
    ])
    debug('Next step:', answers.nextStep)
    if (answers.nextStep === 'exit') process.exit(0)

    if (answers.nextStep === 'pause') {
      attack.stop()
      console.log(chalk.green('\n  ✓', chalk.blue('Attack'), chalk.yellow('paused')))
      return this.nextStep(attack, 'resume')
    }

    attack.start()
    console.log(chalk.green('\n  ✓', chalk.blue('Attack'), 'resumed'))
    return this.nextStep(attack, 'pause')
  }
}

module.exports = Inquiries
