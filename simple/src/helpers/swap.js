import { constants } from 'swap.app'
import Swap from 'swap.swap'

import crypto from 'crypto'
import on from './on'

export const get = (id) => new Swap(id)

export const onStep = (swap, _step) => new Promise(async resolve => {
  if (_step <= swap.flow.state.step)
    resolve(swap.flow.state.step)

  console.log('begin waiting step =', _step, 'on', swap.id)

  const enterStep = step => {
    console.log('waiting for', _step, 'now on', step)

    if (step === _step) {
      resolve(step)

      swap.off('enter step', enterStep)
    }
  }

  swap.on('enter step', enterStep)
})

export const generateSecret = () => crypto.randomBytes(32).toString('hex')

export const start = swap =>
  new Promise(async resolve => {
    switch (swap.flow._flowName) {
      case "BTC2ETH":
        await onStep(swap, 2)

        const secret = generateSecret()
        swap.flow.submitSecret(secret)

        break;
      case "ETH2BTC":
        await onStep(swap, 1)
        swap.flow.sign()

        await onStep(swap, 3)
        swap.flow.verifyBtcScript()
        break;
    }
    resolve()
  })

module.exports = { get, onStep, start }
