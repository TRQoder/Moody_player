const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Uploads a file to ImageKit and returns the public URL.

 * @param {Buffer|string} file - The file to upload. Can be a `Buffer`, a Base64 string, or a file URL.
 * @param {string} [folder="new"] - optional The target folder path in your ImageKit account.
 * @returns {Promise<string>} The public URL of the uploaded file.
 * @throws {Error} If the upload fails, an error is thrown.
 *
 * @example
 * // Example with a buffer (Node.js file upload)
 * const url = await uploadFile(req.file.buffer, "songs");
 * console.log(url); // https://ik.imagekit.io/your_id/songs/...
 */

async function uploadFile(file, folder = "moody_player_audio") {
  try {
    const res = await imagekit.upload({
      file: file,
      fileName: Date.now(),
      folder,
    });
    return res.url;
  } catch (error) {
    console.log("ImageKit upload failed:", error.message);
    throw error;
  }
}

module.exports = uploadFile;
