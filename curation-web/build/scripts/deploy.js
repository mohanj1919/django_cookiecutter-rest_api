const AWS = require("aws-sdk");
const mime = require('mime-types');
const fs = require("fs");
const path = require("path");

const config = {
    s3BucketName: process.env.AWS_BUCKET,
    folderPath: '../../dist'
};

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3({
    signatureVersion: 'v4'
});

const distFolderPath = path.join(__dirname, config.folderPath);

var files = getFiles(distFolderPath);

console.log(`Found ${files.length} files\n`);

pushToS3();

// Return file path as given in dist folder
function getFileName(name) {
    return name.split('\dist/')[1];
}

// Return all available files in specified folder
function getFiles(dir, _files) {
    _files = _files || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, _files);
        } else {
            _files.push(name);
        }
    }
    return _files;
}

//Push identified files to given S3 Bucket
function pushToS3() {
    try {
        files.map(function(name) {
            fs.readFile(name, (error, fileContent) => {
                if (error) {
                    throw error;
                }
                const mimeType = mime.lookup(name);
                const s3FileName = getFileName(name);
                // upload file to S3
                s3.putObject({
                    Bucket: config.s3BucketName,
                    Key: s3FileName,
                    Body: fileContent,
                    ContentType: `${mimeType}`
                }, (err) => {
                    if (err) {
                        throw err
                    } else {
                        console.log(`Successfully pushed ${s3FileName} to Bucket - ${config.s3BucketName}`)
                    }
                });
            });
        });
    } catch (error) {
        console.log(`Error pushing to S3: ${error}`);
    }
}