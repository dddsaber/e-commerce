const { StatusCodes } = require("http-status-codes");
const response = require("../utils/response.utils");
const { v4: uuidv4 } = require("uuid");
const { TYPE_IMAGE } = require("../utils/constants.utils");

// const blobString = ""; // Blob Connection String

//Upload Files to Local Directory
const uploadFile = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    let msg = "No file found !";
    return response(res, StatusCodes.BAD_REQUEST, false, {}, msg);
  }

  try {
    const file = req.files.file;
    const { type } = req.params;

    let fileName = `${type}_${uuidv4()}_${file.name}`;
    let filePath;
    if (type.startsWith(TYPE_IMAGE.product)) {
      filePath = `products/${fileName}`;
    } else if (type.startsWith(TYPE_IMAGE.user)) {
      filePath = `users/${fileName}`;
    } else if (type.startsWith(TYPE_IMAGE.store)) {
      filePath = `stores/${fileName}`;
    } else if (type.startsWith(TYPE_IMAGE.review)) {
      filePath = `reviews/${fileName}`;
    } else {
      filePath = `others/${fileName}`;
    }

    file.mv(`uploads/${filePath}`, (err) => {
      if (err) {
        return response(
          res,
          StatusCodes.BAD_REQUEST,
          false,
          { err: err },
          "Could not upload"
        );
      }
      const photoURL = fileName;
      return response(
        res,
        StatusCodes.ACCEPTED,
        true,
        { fileURLs: [photoURL] },
        null
      );
    });
  } catch (error) {
    return response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      {},
      error.message
    );
  }
};

const uploadFiles = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    let msg = "No files found!";
    return response(res, StatusCodes.BAD_REQUEST, false, null, msg);
  }

  try {
    const files = req.files["files[]"]; // Assuming the file input field name is 'files'
    const { type } = req.params;
    // Process each uploaded file
    const fileUploadPromises = files.map(async (file) => {
      let fileName = `${type}_${uuidv4()}_${file.name}`;
      let filePath;
      if (type.startsWith(TYPE_IMAGE.product)) {
        filePath = `products/${fileName}`;
      } else if (type.startsWith(TYPE_IMAGE.user)) {
        filePath = `users/${fileName}`;
      } else if (type.startsWith(TYPE_IMAGE.store)) {
        filePath = `stores/${fileName}`;
      } else if (type.startsWith(TYPE_IMAGE.review)) {
        filePath = `reviews/${fileName}`;
      } else {
        filePath = `others/${fileName}`;
      }

      // Move the uploaded file to the 'uploads' folder
      await file.mv(`uploads/${filePath}`);

      return fileName;
    });

    // Wait for all file uploads to complete
    const uploadedFiles = await Promise.all(fileUploadPromises);

    return response(
      res,
      StatusCodes.ACCEPTED,
      true,
      { fileURLs: uploadedFiles },
      null
    );
  } catch (error) {
    return response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      {},
      error.message
    );
  }
};

module.exports = {
  uploadFile,
  uploadFiles,
};
