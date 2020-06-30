'use strict'

import dotenv from 'dotenv'
import Credential from './credential.js'

dotenv.config()
main()

async function main() {
    if (! process.env.SALT || ! process.env.SECRET_KEY) {
        console.log('Please execute $ npm run generate_key')
        return
    }
    const createCredential = async () => {
        const credential = new Credential()
        await credential.init()
        return credential
    }
    let c = await createCredential()
    console.log(c)
}
