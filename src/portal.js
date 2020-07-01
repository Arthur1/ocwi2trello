'use strict'

import puppeteer from 'puppeteer'

export default class Portal {
    constructor(credential) {
        this.credential = credential
        this.browser = null
        this.page = null
        this.PORTAL_LOGIN_URL = 'https://portal.nap.gsic.titech.ac.jp/GetAccess/Login?Template=userpass_key&AUTHMETHOD=UserPassword',
        this.PORTAL_HOME_URL = 'https://portal.nap.gsic.titech.ac.jp/GetAccess/ResourceList'
        this.OCWI_LOGIN_URL = 'https://secure.ocw.titech.ac.jp/ocwi/index.php'
        this.OCWI_SUBJECTS_URL = 'https://secure.ocw.titech.ac.jp/ocwi/index.php?module=Ocwi&action=Subject'
    }

    async open() {
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

    async close() {
        await this.browser.close()
    }

    async loginToPortal() {
        // 学籍番号・パスワード
        try {
            await this.page.goto(this.PORTAL_LOGIN_URL, { waitUntil: 'domcontentloaded' })
            // await this.page.screenshot({ path: 'test0.png' })
            await this.page.type('input[name="usr_name"]', this.credential.user.id)
            await this.page.type('input[name="usr_password"]', this.credential.user.password)
            await Promise.all([
                this.page.click('input[type="submit"][name="OK"]'),
                this.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
            ])
            // await this.page.screenshot({ path: 'test1.png' })

            // OTP認証をスキップ
            await this.page.select('select[name="message3"]', 'GridAuthOption')
            await Promise.all([
                this.page.click('input[type="submit"][name="OK"]'),
                this.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
            ])
            // await this.page.screenshot({ path: 'test2.png' })

            // Matrixコード
            for (let i = 4; i <= 6; i++) {
                let matrixKey = await this.page.$eval(`[id="authentication"] tr:nth-of-type(${i}) th:nth-of-type(1)`, item => item.textContent)
                await this.page.type(`input[name="message${i - 1}"]`, this.credential.getMatrixValueByKey(matrixKey))
            }
            await Promise.all([
                this.page.click('input[type="submit"][name="OK"]'),
                this.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
            ])
            // await this.page.screenshot({ path: 'test3.png' })
        } catch (e) {
            console.log(e)
            await this.browser.close()
            process.exit(1)
        }
    }

    async loginToOCWi() {
        try {
            await this.page.goto(this.OCWI_LOGIN_URL, {
                referer: this.PORTAL_HOME_URL,
                waitUntil: ['load', 'networkidle0']
            }) 
            // await this.page.screenshot({ path: 'test4.png' })
        } catch (e) {
            console.log(e)
            await this.browser.close()
            process.exit(1)
        }
    }

    async getSubjectsList() {
        try {
            await this.page.goto(this.OCWI_SUBJECTS_URL, { waitUntil: 'domcontentloaded' })
            // await this.page.screenshot({ path: 'test5.png' })
            // await this.page.goto('file:///Users/arthur/Desktop/%E8%AA%B2%E9%A1%8C%E4%B8%80%E8%A6%A7-%20TOKYO%20TECH%20OCW-i.html', { waitUntil: 'domcontentloaded' })
            const rows = await this.page.$$('table tr')
            rows.shift()
            const list = await Promise.all(rows.map(async row => {
                const cells = await row.$$('td')
                let record = {
                    id: (await cells[4].$eval('a', el => el.getAttribute('href'))).replace('index.php?module=Ocwi&action=SubjectHandIn&', '').replace('https://secure.ocw.titech.ac.jp/ocwi/', ''),
                    course: {
                        name: await (await cells[3].getProperty('textContent')).jsonValue(),
                        instructors: await (await cells[5].getProperty('textContent')).jsonValue(),
                    },
                    subject: {
                        name: await (await cells[4].getProperty('textContent')).jsonValue(),
                        status: await cells[0].$eval('img', el => el.getAttribute('alt')),
                        uri: await cells[4].$eval('a', el => el.getAttribute('href')),
                        due: (await (await cells[1].getProperty('innerHTML')).jsonValue()).replace('<br>', ' '),
                    }
                }
                return record
            }))
            return list
        } catch (e) {
            console.log(e)
            await this.browser.close()
            process.exit(1)
        }
    }
}