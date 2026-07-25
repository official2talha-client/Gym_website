import multer from 'multer'

const storage = multer.diskStorage({//it commands your multer to save files to your servers filesystem//
    destination:function(req,file,cb){//it highlights where the file should stored when it comes from frontend//
        cb(null,"./public/temp")
    },
    filename: function(req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + "-" + file.originalname);
  }
})

export const upload = multer({storage})