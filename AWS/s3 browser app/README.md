
# S3 Browser App (ArcGIS + AWS SDK) — README

> **Sanitized for publication** — replace placeholders like `YOUR-S3-BUCKET-NAME`, `YOUR-IDENTITY-POOL-ID`, and `YOURBrowserPool` with your actual values.

## Overview
A static HTML + JavaScript app (no backend) that lets users **upload**, **list**, **view**, and **delete** JPEGs in Amazon S3 directly from the browser. It uses:

- **ArcGIS Maps SDK for JavaScript (ESM)** for the UI shell
- **AWS SDK for JavaScript (v2)** for S3 operations
- **Amazon Cognito Identity Pool** for temporary, browser-based credentials

## Architecture (browser-only)
```
Browser (index.html)
  → Cognito Identity Pool (temporary AWS credentials)
  → S3 Bucket (Upload/List/Show/Delete)
```

## Cognito setup (sanitized example)
Create an **Identity Pool** named `YOURBrowserPool`. Enable **guest (unauthenticated) access**.
The automatically generated guest role will resemble:
- `service-role/Cognito_YOURBucketUnauth_Role`

Record the **Identity Pool ID** as:
- `YOUR-IDENTITY-POOL-ID`

Use this value in your `index.html`.

## Prerequisites
- S3 bucket: `YOUR-S3-BUCKET-NAME` in region `YOUR-AWS-REGION`
- Identity Pool: `YOUR-IDENTITY-POOL-ID`
- App hosted at: `YOUR-APP-ORIGIN-URL`

## CORS configuration (S3 bucket)
```json
[
  {
    "AllowedOrigins": ["YOUR-APP-ORIGIN-URL"],
    "AllowedMethods": ["GET","PUT","DELETE","HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag","x-amz-request-id","x-amz-id-2"],
    "MaxAgeSeconds": 3000
  }
]
```

## IAM policy for Cognito unauth role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListObjectsScoped",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::YOUR-S3-BUCKET-NAME",
      "Condition": {
        "StringLike": {"s3:prefix": ["YOUR-PREFIX/*", "YOUR-PREFIX/"]}
      }
    },
    {
      "Sid": "ObjectCRUD",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR-S3-BUCKET-NAME/YOUR-PREFIX/*"
    },
    {
      "Sid": "BucketLocation",
      "Effect": "Allow",
      "Action": ["s3:GetBucketLocation"],
      "Resource": "arn:aws:s3:::YOUR-S3-BUCKET-NAME"
    }
  ]
}
```

## index.html integration
- Use endpoint: `https://s3.YOUR-AWS-REGION.amazonaws.com`
- Enable path-style: `s3ForcePathStyle: true`
- Always pass `Bucket: YOUR-S3-BUCKET-NAME` in all S3 calls

## Troubleshooting
- **CORS errors** → check your AllowedOrigins
- **AccessDenied** → check IAM permissions
- **Image not loading** → signed URL may have expired

## License
Choose the license appropriate for your project.
