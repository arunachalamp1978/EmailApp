const EmailProvider = require ('./EmailProvider');
const config        = require('../../../config');
const emailsParser  = require('../../utils/email-array-to-angle-brackets');

const buildEmailContent = Symbol();
const addRecipients = Symbol();

class MailGun extends EmailProvider {

  constructor (name) {
    super(name);
  }

  buildRequestData(to, cc, bcc, subject, message) {
    const { protocol, url, privateKey, domain } = config.emailProviders.mailGun;

    const formData = this[buildEmailContent](to, cc, bcc, subject, message);

    return {
      url: `${protocol}api:${privateKey}@${url}/${domain}/messages`,
      timeout: config.emailProviders.timeoutInMs,
      form: formData
    };
  }

  [buildEmailContent](to, cc, bcc, subject, message) {
    let emailForm = this[addRecipients](to, cc, bcc);
        emailForm.subject = subject;
        emailForm.text = message;

    return emailForm;
  }

  [addRecipients](to, cc, bcc) {
    let recipients = {
      from: config.emailProviders.mailGun.fromAddress,
      to: emailsParser(to)
    };

    if(cc)
      recipients.cc = emailsParser(cc);

    if(bcc)
      recipients.bcc = emailsParser(bcc);

    return recipients;
  }
}

module.exports = MailGun;
