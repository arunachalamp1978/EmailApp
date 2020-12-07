const EmailProvider = require ('./EmailProvider');
const config        = require('../../../config');


const buildHeader = Symbol();
const buildEmailContent = Symbol();
const emailsParser = Symbol();

class SendGrid extends EmailProvider {

  constructor(name) {
    super(name);
  }

  buildRequestData(to, cc, bcc, subject, message) {
    const { url, apiKey } = config.emailProviders.sendGrid;

    const header   = this[buildHeader](apiKey);
    const formData = this[buildEmailContent](to, cc, bcc, subject, message);

    return {
      url: `${url}`,
      timeout: config.emailProviders.timeoutInMs,
      headers: header,
      json: formData
    };
  }

  [buildHeader](apiKey) {
    return {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  [buildEmailContent](to, cc, bcc, subject, message) {
    let emailForm = {
      personalizations: [{
        to: this[emailsParser](to)
      }],
      from: {
        email: config.emailProviders.sendGrid.fromAddress
      },
      content: [{
        type: 'text/plain',
        value: message
      }]
    };

    if(cc)
      emailForm.personalizations[0].cc = this[emailsParser](cc);

    if(bcc)
      emailForm.personalizations[0].bcc = this[emailsParser](bcc);

    emailForm.personalizations[0].subject = subject;

    return emailForm;
  }

  [emailsParser](emails) {
    let recipients = emails.map((email) => {
      return { email: email };
    });

    return recipients;
  }
}

module.exports = SendGrid;
