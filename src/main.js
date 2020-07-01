'use strict'

import dotenv from 'dotenv'
import Credential from './credential.js'
import Portal from './portal.js'
import Subjects from './subjects.js'
import Trello from 'trello'

dotenv.config()
main()

async function main() {
    if (! process.env.SALT || ! process.env.SECRET_KEY) {
        console.log('Please execute $ npm run generate_key')
        return
    }
    if (! process.env.TRELLO_KEY || ! process.env.TRELLO_TOKEN) {
        console.log('Please set trello application key & user token')
        return
    }
    if (! process.env.TRELLO_USER_ID) {
        console.log('Please set trello user id')
        return
    }
    if (! process.env.TRELLO_LIST_ID) {
        console.log('Please execute "npm run get_trello_boards" and set list id')
        return
    }


    const credential = new Credential()
    await credential.init()

    const portal = new Portal(credential)
    await portal.open()
    await portal.loginToPortal()
    console.log('logged in Portal')
    await portal.loginToOCWi()
    console.log('logged in OCWi')
    const subjectsList = await portal.getSubjectsList()
    console.log('got subjects list')
    await portal.close()

    const subjects = new Subjects(subjectsList)
    const newSubjects = await subjects.allWIPNew()
    console.log('got new subjects list')

    const trello = new Trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN)
    for (const record of newSubjects) {
        let query = trello.createQuery()
        query.name = record.subject.name
        query.idList = process.env.TRELLO_LIST_ID
        query.due = new Date(record.subject.due)
        query.pos = 'top'
        try {
            await trello.makeRequest('post', '/1/cards', query)
        } catch (e) {
            console.log(e)
        }
    }
}
