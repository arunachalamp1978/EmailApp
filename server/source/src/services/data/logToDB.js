let emailSchema = require("./email-model");

exports.logToDB = async (emailJob) => {
    
    try {

        console.log(' emailJob '+ JSON.stringify(emailJob));
        
        const email = new emailSchema({
            to: emailJob.email.to,
            cc: emailJob.email.cc,  
            bcc: emailJob.email.bcc,
            subject: emailJob.email.subject,
            message: emailJob.email.message
        })
        let addedEmail = await email.save();
        console.log(' Added email : ' + addedEmail);

    } catch (err) {
        console.log(err)
    }
}
