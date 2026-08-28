import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, ShadingType } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

async function generateDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "AWS S3 Complete Master Production Setup Guide",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
          new Paragraph({
            text: "Standard Operating Procedure (SOP) for JobMarket Platform",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "Standard Operating Procedure (SOP) for JobMarket Platform",
                italics: true,
                color: "555555",
              })
            ]
          }),

          // STEP 1
          new Paragraph({
            text: "Step 1: Create the AWS S3 Bucket",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "1. Log into your AWS Management Console (https://console.aws.amazon.com/)." })]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "2. In the top search bar, search for 'S3' and click on S3 (Scalable Storage in the Cloud)." })]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "3. Click the orange 'Create bucket' button." })]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "4. Bucket Name: ", bold: true }),
              new TextRun({ text: "Enter a globally unique lowercase name (e.g. csn-jobmarket-production-media)." })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "5. AWS Region: ", bold: true }),
              new TextRun({ text: "Select your desired region (e.g. Europe (Stockholm) eu-north-1 or Asia Pacific (Mumbai) ap-south-1)." })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "6. Object Ownership: ", bold: true }),
              new TextRun({ text: "Select 'ACLs disabled (recommended)'." })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "7. Block Public Access settings: ", bold: true }),
              new TextRun({ text: "UNCHECK 'Block all public access'. Check the acknowledgment box confirming public objects." })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "8. Default Encryption: ", bold: true }),
              new TextRun({ text: "Select Server-side encryption with Amazon S3 managed keys (SSE-S3)." })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: "9. Click 'Create bucket' at the bottom of the page." })]
          }),

          // STEP 2
          new Paragraph({
            text: "Step 2: Configure Bucket Permissions & Public Read Policy",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 150 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "1. Click on your newly created bucket name." })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "2. Open the 'Permissions' tab and scroll to 'Bucket policy'." })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "3. Click 'Edit' and paste the following policy JSON:" })]
          }),
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: `{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Sid": "PublicReadGetObject",\n      "Effect": "Allow",\n      "Principal": "*",\n      "Action": "s3:GetObject",\n      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"\n    }\n  ]\n}`,
                font: "Courier New",
                size: 19,
                color: "003366",
              })
            ]
          }),
          new Paragraph({
            children: [new TextRun({ text: "4. Replace YOUR_BUCKET_NAME with your bucket name (e.g. csn-jobmarket-production-media) and click 'Save changes'." })]
          }),

          // STEP 3
          new Paragraph({
            text: "Step 3: Configure CORS (Cross-Origin Resource Sharing)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 150 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "1. Under the same 'Permissions' tab, scroll down to 'Cross-origin resource sharing (CORS)'." })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "2. Click 'Edit' and paste the following CORS JSON:" })]
          }),
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: `[\n  {\n    "AllowedHeaders": ["*"],\n    "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],\n    "AllowedOrigins": ["*"],\n    "ExposeHeaders": ["ETag", "x-amz-server-side-encryption"],\n    "MaxAgeSeconds": 3600\n  }\n]`,
                font: "Courier New",
                size: 19,
                color: "003366",
              })
            ]
          }),
          new Paragraph({
            children: [new TextRun({ text: "3. Click 'Save changes'." })]
          }),

          // STEP 4
          new Paragraph({
            text: "Step 4: Create IAM User & Generate API Access Keys",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 150 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "1. In the AWS search bar, type 'IAM' and click on IAM." })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "2. Click Users -> Create user. Name the user: jobmarket-s3-app-user." })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "3. Under Permissions options, select 'Attach policies directly' -> click 'Create policy'." })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "4. In the JSON tab of the policy editor, paste:" })]
          }),
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: `{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": [\n        "s3:PutObject",\n        "s3:GetObject",\n        "s3:DeleteObject",\n        "s3:ListBucket"\n      ],\n      "Resource": [\n        "arn:aws:s3:::YOUR_BUCKET_NAME",\n        "arn:aws:s3:::YOUR_BUCKET_NAME/*"\n      ]\n    }\n  ]\n}`,
                font: "Courier New",
                size: 19,
                color: "003366",
              })
            ]
          }),
          new Paragraph({
            children: [new TextRun({ text: "5. Name the policy 'JobMarketS3AppPolicy' and save it." })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "6. Return to user creation, select 'JobMarketS3AppPolicy', and finish creating the user." })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "7. Click on the user -> Security credentials tab -> Create access key -> choose 'Application running outside AWS'." })]
          }),
          new Paragraph({
            children: [new TextRun({ text: "8. Copy and save your Access Key ID and Secret Access Key." })]
          }),

          // STEP 5
          new Paragraph({
            text: "Step 5: Production Environment Variables (.env)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 150 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "Add the following 4 environment variables to your production hosting server (e.g. Render, AWS EC2, VPS):" })]
          }),
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: `AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxxx\nAWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\nAWS_REGION=eu-north-1\nAWS_S3_BUCKET_NAME=csn-jobmarket-production-media`,
                font: "Courier New",
                size: 19,
                color: "003366",
                bold: true,
              })
            ]
          }),

          // STEP 6
          new Paragraph({
            text: "Step 6: Bucket Folder Structure & Live Verification",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 150 },
          }),
          new Paragraph({
            children: [new TextRun({ text: "The backend will automatically create and organize files into these folders:" })]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "profiles/ : ", bold: true }),
              new TextRun({ text: "Candidate & Employer profile avatars and company logos." })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "resumes/ : ", bold: true }),
              new TextRun({ text: "Candidate resume PDFs and documents." })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "company_logos/ : ", bold: true }),
              new TextRun({ text: "Employer job post logos." })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "support/ : ", bold: true }),
              new TextRun({ text: "Helpdesk ticket attachments & screenshot replies." })
            ]
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: "static/ : ", bold: true }),
              new TextRun({ text: "Banner advertisements and marketing media." })
            ]
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join('/Users/yogesh/Desktop/JobMarket', 'AWS_S3_Production_Setup_Guide.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Word document generated successfully at:', outPath);
}

generateDocx().catch(console.error);
