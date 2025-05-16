import nodemailer from 'nodemailer';

// Function to send an email with the given HTML content to the specified recipients
export default async function sendEmailFuction(subject, recipientEmails, htmlContent) {
    if (!recipientEmails || recipientEmails.length === 0) {
        console.error("Error: No recipients defined.");
        return { success: false, error: "No recipients defined." };
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'kajmatejob@gmail.com',
            pass: 'canfwbohnodpcqfl', 
        },
    });

    // Create the email message
    const mailOptions = {
        from: 'kajmatejob@gmail.com',
        to: recipientEmails.join(','), 
        subject: subject, 
        html: htmlContent, 
    };

    // Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        ('Email sent successfully:', info.response);
        return { success: true, info };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}