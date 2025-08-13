const songModel = require("../models/song.model");
const uploadFile = require("../services/storage.services");

const createSongController = async (req, res) => {
  const { artist, title, mood } = req.body;
  const audioUrl = await uploadFile(req.file.buffer);

  const song = await songModel.create({
    title,
    artist,
    mood,
    audio: audioUrl,
  });

  res.status(201).json({
    message: "song created successfully",
    song,
  });
};

const fetchSongController = async (req, res) => {
  const { mood } = req.query;
  const songs = await songModel.find({
    mood,
  });

  res.status(200).json({
    message: "song fetched successfully",
    songs,
  });
};

module.exports = { createSongController, fetchSongController };
