import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix); 
  },
});

const fileFilter = function (req, file, cb) {
  // Check if the file is a JPEG or PNG image
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only JPEG and PNG images are allowed.'), false); // Reject the file
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
export default upload;
