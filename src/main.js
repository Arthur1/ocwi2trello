'use strict'

import dotenv from 'dotenv'
import Credential from './credential.js'
import Portal from './portal.js'

dotenv.config()
main()

async function main() {
    if (! process.env.SALT || ! process.env.SECRET_KEY) {
        console.log('Please execute $ npm run generate_key')
        return
    }

    const credential = new Credential()
    await credential.init()

    const portal = new Portal(credential)
    await portal.init()
    await portal.login()
}
