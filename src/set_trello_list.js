'use strict'

import dotenv from 'dotenv'
import Trello from 'trello'
import cliSelect from 'cli-select'
import fs from 'fs/promises'

dotenv.config()
main()

async function main() {
    if (! process.env.TRELLO_USER_ID || ! process.env.TRELLO_KEY || ! process.env.TRELLO_TOKEN) {
        console.log('Please set trello application key & user token')
        process.exit(1)
    }
    
    const trello = new Trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN)
    const boards = await trello.getBoards(process.env.TRELLO_USER_ID)
    
    console.log('Select Board')
    const resBoard = await cliSelect({ values: boards.map(record => record.name) })

    const lists = await trello.getListsOnBoard(boards[resBoard.id].id)
    const resList = await cliSelect({ values: lists.map(record => record.name) })

    const listID = lists[resList.id].id
    await fs.appendFile('.env', `TRELLO_LIST_ID="${listID}"\n`, 'utf-8')
    console.log('Success!')
}
