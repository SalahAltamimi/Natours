const nodemailer = require('nodemailer');
const { htmlToText } = require('html-to-text');
const pug = require('pug');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.firstName = user.name.split(' ')[0];
    this.from = `GM <${process.env.GM}>`;
  }
  newTransport() {
    return nodemailer.createTransport({
      port: 2525,
      host: process.env.HOST,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });
  }
  async send(temp, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${temp}.pug`, {
      firstName: this.firstName,
      subject,
      url: this.url,
    });
    const mailOption = {
      from: this.from,
      to: this.to,
      text: htmlToText(html),
      subject,
      html,
    };
    await this.newTransport().sendMail(mailOption);
  }
  async sendWelcom() {
    await this.send('welcom', 'Welcome to Natours');
  }
  async sendReset() {
    await this.send('resetPassword', 'forgot password will expier after 10m');
  }
};
// exports.sendemails = async (option) => {
//   const transport = nodemailer.createTransport({
//     port: 2525,
//     host: process.env.HOST,
//     auth: {
//       user: process.env.USER,
//       pass: process.env.PASS,
//     },
//   });

//   const mailoption = {
//     from: 'Gm <salah@altamimiGroup.com>',
//     to: option.email,
//     subject: option.email,
//     text: option.message,
//   };

//   await transport.sendMail(mailoption);
// };
