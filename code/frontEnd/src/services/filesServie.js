import { getReq } from '../utils/myAxios.js'

const getMusicList = () => {
    return getReq('files/getMusicList')
}

const getNotExistFile = () => {
    return getReq('files/getNotExistFile')
}

export {
    getMusicList,
    getNotExistFile
}