const multer = require("multer");
const boom = require("@hapi/boom");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename(req, file, cb) {
    const extensionName = file.mimetype.split("/")[1];
    cb(null, `${file.fieldname}-${Date.now()}.${extensionName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(undefined, true);
    }
    cb(boom.badRequest("the file must be jpg,jpeg or png"));
  }
});

module.exports = upload;
