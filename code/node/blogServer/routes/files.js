var express = require('express');
var router = express.Router();
const { getMusicList, getNotExistFile } = require('../controllers/fileController')

router.get('/getMusicList', async function(req, res, next) {
    try {
        const filePromise = await getMusicList()
        res.send({ code:1, data: JSON.parse(filePromise) })
    } catch {
        res.send({ code: 0, msg: '文件未找到' })
    }
});

router.get('/getNotExistFile', async function(req, res, next) {
    try {
        const filePromise = await getNotExistFile()
        res.send({ code:1, data: JSON.parse(filePromise) })
    } catch {
        res.send({ code: 0, msg: '文件未找到' })
    }
});

module.exports = router;
