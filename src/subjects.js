'use strict'

import fs from 'fs/promises'

export default class Subjects {
    constructor(subjectsList) {
        this.subjectsList = subjectsList
    }

    allWIP() {
        return this.subjectsList.filter(record => record.subject.status === '未提出')
    }

    async allWIPNew() {
        const IDList = this.allWIPID()
        let oldIDList = []
        try {
            oldIDList = JSON.parse(await fs.readFile('log.json', 'utf-8'))
        } catch (e) {}
        const diffList = IDList.filter(uri => ! oldIDList.includes(uri))
        await this.save()
        return this.subjectsList.filter(record => diffList.includes(record.id))
    }

    allWIPID() {
        return this.allWIP().map(record => record.id)
    }

    async save() {
        const IDList = this.allWIPID()
        await fs.writeFile('log.json', JSON.stringify(IDList), 'utf-8')
    }
}