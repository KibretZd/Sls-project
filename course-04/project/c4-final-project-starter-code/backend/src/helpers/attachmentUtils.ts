import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
  })

  const mybucket = process.env.ATTACHMENT_S3_BUCKET
  const urlExpiration = 3000

export function getUploadUrl(todoId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: mybucket,
      Key: todoId,
      Expires: urlExpiration
    })
  }