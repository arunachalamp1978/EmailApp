const request = require('request');

class EmailProvider {

  constructor(name){
    this.name = name;
    this.errorCounter = 0;
  }

  sendEmail(to, cc, bcc, subject, message, callback) {
    try {
      const requestData = this.buildRequestData(to, cc, bcc, subject, message);
      request.post(requestData, (err, httpResponse, body) => {
        if (err)
          return callback(err);

        let response = {
          code: httpResponse.statusCode,
          message: body
        };

        if ((httpResponse.statusCode != 200) && ((httpResponse.statusCode != 202)))
          return callback({ error: response });
        else
          return callback(null, response);
      });
    }
    catch(e)
    {
      return callback(this.name);
    }
  }

  buildRequestData() {
    throw new Error('You have to implement the method buildRequestData!');
  }

  setErrorCounter(counter) {
    this.errorCounter = counter;
    console.log(`${this.name} error counter ${this.errorCounter}`);
  }

  getErrorCounter() {
    return this.errorCounter;
  }

  getName() {
    return this.name;
  }

}

module.exports = EmailProvider;
