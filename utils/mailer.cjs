require("dotenv").config()
const nodemailer = require("nodemailer")
const fs = require("fs")

const emailOptions = {
    "cancellation": "We hope this message finds you well. We regret to inform you that your booking has been canceled." +
            "We understand that circumstances can change, and we sincerely apologize for any " +
        "inconvenience this may cause.<br> If you have any questions or need further assistance, please do not hesitate to reach out to our customer support team.\n" +
        "\n" +
        "We value your patronage and hope to have the opportunity to serve you in the future. Should you wish to rebook or make a new reservation," +
        " our team will be more than happy to assist you.",
    "notification": "This is a friendly reminder that you have an upcoming appointment scheduled with a client in just 15 minutes.\n" +
        "Please ensure that you are prepared and available for the meeting. If you have any last-minute preparations or need to access any relevant documents, now would be a good time to do so.\n" +
        "If you need to reschedule or cancel the appointment, you may do so through our website.<br>\n" +
        "We value your commitment to your appointments, and your punctuality is greatly appreciated.\n" +
        "If you have any questions or require any further assistance, feel free to reach out to us.\n" +
        "Thank you for using our appointment scheduling service, and we hope the meeting goes smoothly."
}

const senderEmail = process.env.MAIL_ID;
const password = process.env.PASSWORD;

async function sendEmail(receiver, user, subject, option) {
    try {
        let emailTemp = fs.readFileSync("./utils//emailTemplate.html", "utf-8");
        let emailBody = emailTemp.replace("{{user}}", user).replace("{{message}}", emailOptions[option])
        const options = {
            from: senderEmail,
            to: receiver,
            cc: [],
            bcc: [],
            subject: subject,
            html: emailBody
        }
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false,
            auth: {
                user: senderEmail,
                pass: password
            }
        })

        await transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log("Unable to send mail: " + err)
            } else {
                console.log("Email sent successfully")
            }
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = {sendEmail}
