const multer = require("multer")
const { createSongController, fetchSongController } = require("../controllers/songs.controllers")

const router = require("express").Router()

const upload = multer({storage:multer.memoryStorage()})

router.post("/songs",upload.single("audio"),createSongController)
router.get("/songs",fetchSongController)

module.exports = router