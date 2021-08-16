import { getMusicList, getNotExistFile } from '../services/filesServie.js'

const musicListPromise = getMusicList()

const notExistFilePromise = getNotExistFile()

console.log(musicListPromise)
console.log(notExistFilePromise)
