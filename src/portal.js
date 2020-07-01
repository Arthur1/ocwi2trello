'use strict'

import puppeteer from 'puppeteer'

export default class Portal {
    constructor(credential) {
        this.credential = credential
        this.browser = null
        this.page = null
        this.INIT_URL = 'https://portal.nap.gsic.titech.ac.jp/GetAccess/Login?Template=userpass_key&AUTHMETHOD=UserPassword'
    }

    async init() {
        const option = {
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--lang=ja'
            ]
        }
        this.browser = await puppeteer.launch(option)
        this.page = await this.browser.newPage()
        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'ja-JP'
        })
    }

    async login() {
        // 学籍番号・パスワード
        await this.page.goto(this.INIT_URL, { waitUntil: 'domcontentloaded' })
        await this.page.type('input[name="usr_name"]', this.credential.user.id)
        await this.page.type('input[name="usr_password"]', this.credential.user.password)
        this.page.click('input[type="submit"][name="OK"]')
        await this.page.waitForNavigation({ waitUntil: 'domcontentloaded' })

        // OTP認証をスキップ
        await this.page.select('select[name="message3"]', 'GridAuthOption')
        this.page.click('input[type="submit"][name="OK"]')
        await this.page.waitForNavigation({ waitUntil: 'domcontentloaded' })

        // Matrixコード
        for (let i = 4; i <= 6; i++) {
            let matrixKey = await this.page.$eval(`[id="authentication"] tr:nth-of-type(${i}) th:nth-of-type(1)`, item => item.textContent)
            await this.page.type(`input[name="message${i - 1}"]`, this.credential.getMatrixValueByKey(matrixKey))
        }
        this.page.click('input[type="submit"][name="OK"]')
        await this.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
        await this.page.screenshot({ path: 'loginPage.png' })
        this.browser.close()
    }
}