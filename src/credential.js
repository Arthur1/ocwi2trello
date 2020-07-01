'use strict'

import fs from 'fs/promises'
import crypto from 'crypto'

export default class Credential {
    constructor() {
        this.user = {
            id: null,
            password: null
        }
        this.matrixCode = []
        this.algorithm = 'aes-256-cbc'
        this.encryptedUser = {}
        this.encryptedMatrixCode = {}
    }

    async init() {
        try {
            this.encryptedUser.iv = await fs.readFile('credentials/user_iv')
            this.encryptedUser.data = await fs.readFile('credentials/user')
            this.decryptUser()
            this.encryptedMatrixCode.iv = await fs.readFile('credentials/matrix-code_iv')
            this.encryptedMatrixCode.data = await fs.readFile('credentials/matrix-code')
            this.decryptMatrixCode()
        } catch (e) {
            console.log('init!')
            this.user.id = rl.question('Student ID?: ')
            this.user.password = rl.question('Password?: ', { hideEchoBack: true })

            let matrixCodePath = rl.question('Matrix Code File Name? (matrix-code.json): ')
            if (! matrixCodePath) matrixCodePath = 'matrix-code.json'
            this.matrixCode = JSON.parse(await fs.readFile(matrixCodePath, 'utf8'))

            await fs.mkdir('credentials').catch(() => {})
            await this.encryptUser()
            await this.encryptMatrixCode()
        }
        return
    }

    async encryptUser() {
        const str = JSON.stringify(this.user)
        const data = Buffer.from(str)
        const {iv, encryptedData} = this.encrypt(data)
        await fs.writeFile('credentials/user_iv', iv)
        await fs.writeFile('credentials/user', encryptedData)
    }

    async encryptMatrixCode() {
        const str = JSON.stringify(this.matrixCode)
        const data = Buffer.from(str)
        const {iv, encryptedData} = this.encrypt(data)
        await fs.writeFile('credentials/matrix-code_iv', iv)
        await fs.writeFile('credentials/matrix-code', encryptedData)
    }

    decryptUser() {
        const decryptedData = this.decrypt(this.encryptedUser.iv, this.encryptedUser.data)
        this.user = JSON.parse(decryptedData.toString('utf-8'))
    }

    decryptMatrixCode() {
        const decryptedData = this.decrypt(this.encryptedMatrixCode.iv, this.encryptedMatrixCode.data)
        this.matrixCode = JSON.parse(decryptedData.toString('utf-8'))
    }

    encrypt(data) {
        // 鍵を生成
        const key = crypto.scryptSync(process.env.SECRET_KEY, process.env.SALT, 32)
        // IV を生成
        const iv = crypto.randomBytes(16)
        // 暗号器を生成
        const cipher = crypto.createCipheriv(this.algorithm, key, iv)
        // data を暗号化
        let encryptedData = cipher.update(data)
        encryptedData = Buffer.concat([encryptedData, cipher.final()])
        return {iv, encryptedData}
    }

    decrypt(iv, encryptedData) {
        // 鍵を生成
        const key = crypto.scryptSync(process.env.SECRET_KEY, process.env.SALT, 32)
        // 復号器を生成
        const decipher = crypto.createDecipheriv(this.algorithm, key, iv)
        // encryptedData を復号
        let decryptedData = decipher.update(encryptedData)
        decryptedData = Buffer.concat([decryptedData, decipher.final()])
        return decryptedData
    }

    getMatrixValueByKey(key) {
        const xStr = key.slice(1, 2)
        const yStr = key.slice(3, 4)
        const x = xStr.charCodeAt() - 65
        const y = Number(yStr) - 1
        return this.matrixCode[x * 7 + y]
    }
}