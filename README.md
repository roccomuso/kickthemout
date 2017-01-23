# KickThemOut
Kick devices off your network by performing an ARP Spoof attack with **Node.js**.

[![Build Status](https://travis-ci.org/roccomuso/kickthemout.svg?branch=master)](https://travis-ci.org/roccomuso/kickthemout)

[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard) [![NPM](https://nodei.co/npm-dl/kickthemout.png?months=6)](https://nodei.co/npm/kickthemout/)

## Description

A tool to kick devices out of your network and **enjoy all the bandwidth for yourself**.
It allows you to select specific or all devices and ARP spoofs them off your local area network.

Compatible with **Node v4.4.0** and above.

Author: **Rocco Musolino**

## Demo

Here's a short demo:

[![asciicast](https://asciinema.org/a/100375.png)](https://asciinema.org/a/100375)

## Installation

Required dependencies:

    $ sudo apt-get install libpcap-dev

Install from **npm**:

    $ npm install -g kickthemout

(No sudo required for installation. Just recommended for execution)

Or you can download KickThemOut by cloning the [Git Repo](https://github.com/roccomuso/kickthemout) and simply installing its requirements:

    $ git clone https://github.com/roccomuso/kickthemout.git
    $ cd kickthemout
    $ npm install --production


## Usage

    $ sudo kickthemout

### Verbose mode

    $ sudo DEBUG=kickthemout:* kickthemout


## Disclaimer

KickThemOut is provided as is under the MIT Licence (as stated below).
It is built for educational purposes only. If you choose to use it otherwise, the developers will not be held responsible.
In brief, do not use it with evil intent.

## Inspiration

Inspired by the [@k4m4/kickthemout](https://github.com/k4m4/kickthemout) python implementation.

## License

Copyright (c) 2017 by **Rocco Musolino** Some rights reserved.

KickThemOut is under the terms of the [MIT License](https://www.tldrlegal.com/l/mit), following all clarifications stated in the [license file](https://raw.githubusercontent.com/roccomuso/kickthemout/master/LICENSE).
