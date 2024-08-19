const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer for file uploads
const upload = multer({
  dest: uploadDir, // Directory for storing uploaded files
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB file size limit
});

function sendEmail({ email, message, file,fullName,mobile,position,employmentType }) {
    console.log("ttttttttttttt",message)
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      host: "mail.d25ent.com",
      port: 587,
      secure: false,
      auth: {
        user: "contact@d25ent.com",
        pass: "D25Ent@123",
      },
    //   tls: {
    //     rejectUnauthorized: false
    //   }
    });

    const mail_configs = {
      from: email,
      to:"contact@d25ent.com" ,
      subject:`Job Application From ${fullName}`,
      html: `
      <p>Hi, D25 Event Team New Job Application From ${fullName}</p>
       <p>Name: ${fullName}</p>
        <p>Phone: ${mobile}</p>
         <p>${position}</p>
        <p>Employement Type: ${employmentType}</p>
        <p>Message: ${message}</p>
        <p>Best Regards</p>
         <p>D25 Tech Support Team</p>
      `,
      attachments: file ? [
        {
          filename: file.originalname,
          path: path.join(uploadDir, file.filename)
        }
      ] : []
    };

    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.error("Error sending email: ", error);
        return reject({ message: `An error occurred: ${error.message}` });
      }
      console.log("Email sent: " + info.response);
      return resolve({ message: "Email sent successfully" });
    });
  });
}

// Handle form submission with file upload
app.post("/", upload.single('upload'), (req, res) => {
    const { email, fullName, mobile, position, employmentType, message } = req.body;
    const file = req.file; // File info
  
    console.log("Received request:", { email, fullName, mobile, position, employmentType, message, file });
  
    sendEmail({ email, fullName, mobile, position, employmentType, message, file })
      .then((response) => res.send(response.message))
      .catch((error) => {
        console.error("Error in sendEmail:", error);
        res.status(500).send(error.message);
      });
  });
  

app.listen(port, () => {
  console.log(`nodemailerProject is listening at http://localhost:${port}`);
});

