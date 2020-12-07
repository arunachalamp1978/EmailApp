const config    = require ('../../config');

const MailGun   = require ('../services/email/MailGun');
const SendGrid  = require ('../services/email/SendGrid');
const queue     = require ('../services/queue/job-manager');
const log       = require ('../log');


console.log("config " + JSON.stringify(config));

const mailGun = new MailGun(config.emailProviders.mailGun.providerName);
const sendGrid = new SendGrid(config.emailProviders.sendGrid.providerName);


const providers = [
  sendGrid,
  mailGun
];

let currentProvider = null;
let refreshInterval = null;

exports.init = () => {
  currentProvider = providers[0];
  console.log(`Now sending emails using ${currentProvider.getName()}`);
  work();
};

exports.stop = () => {
  clearInterval(refreshInterval);
};

const work = () => {
  refreshInterval = setInterval(sendEmail, config.delayInMsBetweenEmails);
};

const sendEmail = () => {
  queue.popEmailJob((err, emailJob) => {
    if(err)
      log(`Redis error: ${err}`);
      //TODO
        //Integrate with some tool that can help with alerting/debugging
        //this type of error (e.g Newrelic)

    if(emailJob){
      sendEmailUsingProvider(emailJob);
    }
    else {
      //TODO: if need be, some logging can be done for idle reporting . ..
    }
  });
};

const sendEmailUsingProvider = (emailJob) => {
  let { to, cc, bcc, subject, message } = emailJob.email;

  currentProvider.sendEmail(to, cc, bcc, subject, message, (err, response) => {
    if(err){
      pushEmailBackToQueue(emailJob);
      countError(err);
    }
    else {
      log('[' + currentProvider.getName() + ']: Email sent successfully');
      discountError();
    }
  });
};

const pushEmailBackToQueue = (emailJob) => {
  //TODO Add a retry mechanism and/or a fallback database to prevent data loss
  queue.pushEmailJob(emailJob, (err, response) => {
    if(err)
      log('Error puting job back on the queue');
      //TODO
        //Integrate with some tool that can help with alerting/debugging
        //this type of error (e.g Newrelic)
  });
};

const countError = (err) => {
  log(`Error: ${JSON.stringify(err)}`);
  currentProvider.setErrorCounter( currentProvider.getErrorCounter() + 1);
  if(currentProvider.getErrorCounter() >= config.maxErrorsPerProvider){
    currentProvider.setErrorCounter(0);
    changeProvider();
  }
};

const discountError = () => {
  if(currentProvider.getErrorCounter() > 0){
    currentProvider.setErrorCounter( currentProvider.getErrorCounter() - 1 );
  }
};

const changeProvider = () => {
  currentIndex = providers.indexOf(currentProvider);
  nextIndex = (currentIndex < (providers.length - 1))? ++currentIndex : 0;

  currentProvider = providers[nextIndex];
  console.log(`Now sending emails using ${currentProvider.getName()}`);
};
