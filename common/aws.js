const aws = require('aws-sdk');
const config = require("../nodedetails/config");
const s3 = new aws.S3(config.awsOptionsfiles);
aws.config.update(config.krsAWSOptions);
const aws_SES = new aws.SES({ region: 'ap-south-1' });

const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client } = require("@aws-sdk/client-s3")


exports.SendSMail = async (subject, template, recipients , sender , replyTo) => {

  // Create the email parameters
  const params = {
    Destination: {
      ToAddresses: recipients ,
    },
    Message: {
      Body: {
        Html: {
          Data: template,
        },
      },
      Subject: {
        Data: subject,
      },
    },
   
    ReplyToAddresses: [replyTo], 
    Source: sender,
  };

  // Send the email
  aws_SES.sendEmail(params, (err, data) => {
    if (err) {
      console.error('Error sending email:', err);

      if (err.code === 'MessageRejected') {
        console.log('Message rejected:', err.message);

      } else {

        console.error('Other error:', err.message);
      }
    }
    //  else {
    //   console.log('Email sent successfully');
    // }
  });

}


// exports.fileUpload = (file, callback) => {
//     try {
//         if (file != undefined && typeof file != 'undefined') {
//             let splits = file.originalname.split('.');
//             const params = {
//                 Bucket: config.awsOptions.Bucket,
//                 Key: Date.now().toString() + '.' + splits[(splits.length) - 1],
//                 Body: file.buffer,
//                 ACL: 'public-read'
//             }
//             s3.upload(params, (err, data) => {
//                 if (err) {
//                     callback({ "status": false,"error":err });
//                 } else {
//                     callback({ "status": true, "url": data.Location });
//                 }
//             });
//         } else {


//             callback({ "status": false });
//         }
//     } catch (err) {
//         console.log("Error catched in file upload", err)
//         callback({ "status": false });
//     }
// }

exports.fileUpload = async (file, callback) => {
  try {
    if (file != undefined && typeof file != 'undefined') {

      let splits = file.originalname.split('.');
      const params = {
        Bucket: config.awsOptionsfiles.Bucket,
        Key: Date.now().toString() + '.' + splits[(splits.length) - 1],
        Body: file.buffer,
        ACL: 'public-read'
      }
      s3.upload(params, (err, data) => {
        if (err) {
          callback({ "status": false, "error": err });
        } else {
          callback({ "status": true, "url": data.Location });
        }
      });
    } else {


      callback({ "status": false });
    }
  } catch (err) {
    console.log("Error catched in file upload", err)
    callback({ "status": false });
  }
}

const s3Video = new aws.S3(config.awsOptionsCourseVideos);

const s3Video2 = new S3Client({
	region: config.awsOptionsCourseVideos.region,
	credentials: {
		accessKeyId: config.awsOptionsCourseVideos.accessKeyId,
		secretAccessKey: config.awsOptionsCourseVideos.secretAccessKey,
	},
  useAccelerateEndpoint: true,
});

const bucketName = config.awsOptionsCourseVideos.Bucket;

exports.courseVideoUploadTest  = async (file, callback) => {
  try {
    if (file != undefined && typeof file != 'undefined') {

      let splits = file.originalname.split('.');
console.log(file,"file")
      const params = {
        Bucket: bucketName,
        Key: Date.now().toString() + '.' + splits[(splits.length) - 1],
        Body: file.buffer,
      }
    
      try {
        // upload file to s3 parallelly in chunks
        // it supports min 5MB of file size
        const uploadParallel = new Upload({
          client: s3Video2,
          // queueSize: 4, // optional concurrency configuration
			    // partSize: 5542880,
          queueSize: 10, // optional concurrency configuration
          partSize: 10485760, // optional size of each part
          leavePartsOnError: false, // optional manually handle dropped parts
          params,
        })
    
        // checking progress of upload
        uploadParallel.on("httpUploadProgress", progress => {
          console.log(progress)
        })
    
        // after completion of upload
        uploadParallel.done().then(data => {
          console.log("upload completed!", { data })
          callback({ "status": true ,"url":data.Location})
        })
      } catch (error) {
        callback({ "status": false, "error": error });
        
      }

    } else {
      console.log(file,"file")
      callback({ "status": false });
    }
  } catch (err) {
    console.log("Error catched in file upload", err)
    callback({ "status": false });
  }
}

exports.courseVideoUpload  = async (file, callback) => {
  try {
    if (file != undefined && typeof file != 'undefined') {

      let splits = file.originalname.split('.');
      const params = {
        Bucket: config.awsOptionsCourseVideos.Bucket,
        Key: Date.now().toString() + '.' + splits[(splits.length) - 1],
        Body: file.buffer,
        ACL: 'public-read'
      }
      s3Video.upload(params, (err, data) => {
        if (err) {
          callback({ "status": false, "error": err });
        } else {
          callback({ "status": true, "url": data.Location });
        }
      });
    } else {


      callback({ "status": false });
    }
  } catch (err) {
    console.log("Error catched in file upload", err)
    callback({ "status": false });
  }
}

exports.createMultipartUpload  = async (fileName, callback) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileName,
    };
    const upload = await s3.createMultipartUpload(params).promise();
    callback({ uploadId: upload.UploadId });

  } catch (err) {
    console.log("Error catched in file upload", err)
    callback({ "status": false });
  }
}

exports.createuploadLessTest  = async (file, req,callback) => {
  try {
    const s3Params = {
      Bucket: bucketName,
      Key: req.fileName,
      Body: file.buffer,
      PartNumber: Number(req.index) + 1,
      UploadId: req.uploadId
    };
    s3.uploadPart(s3Params, (err, data) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error uploading chunk' });
      }
      return res.json({ success: true, message: 'Chunk uploaded successfully' });
    });

  } catch (err) {
    console.log("Error catched in file upload", err)
    callback({ "status": false });
  }
}


exports.completeUploadTest  = async (req,callback) => {
  try {
 
    const s3Params = {
      Bucket: bucketName,
      Key: req.fileName,
      UploadId: req.uploadId,
    };
  
    s3.listParts(s3Params, (err, data) => {
      if (err) {
        console.log(err);
        callback({ success: false, message: 'Error listing parts' });
      }
      const parts = [];
      data.Parts.forEach(part => {
        parts.push({
          ETag: part.ETag,
          PartNumber: part.PartNumber
        });
      });
  
      s3Params.MultipartUpload = {
        Parts: parts
      };
  
      s3.completeMultipartUpload(s3Params, (err, data) => {
        if (err) {
          console.log(err);
          callback({ success: false, message: 'Error completing upload' });
        }
  
        console.log("data: ", data)
        callback({ success: true, message: 'Upload complete', data: data.Location});
      });
    });

  } catch (err) {
    console.log("Error catched in file upload", err)
    callback({ "status": false });
  }
}


