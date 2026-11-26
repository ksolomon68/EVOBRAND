const {test}=require('node:test');const assert=require('node:assert/strict');
test('SMTP and Resend both receive the campaign plain-text alternative',async()=>{
  const sent=[];
  require.cache[require.resolve('nodemailer')]={exports:{createTransport:()=>({verify:()=>{},sendMail:async message=>{sent.push(message);return {messageId:'test'};}})}};
  require.cache[require.resolve('resend')]={exports:{Resend:class{constructor(){this.emails={send:async message=>{sent.push(message);return {data:{id:'test'}};}};}}}};
  const previous=process.env.SMTP_HOST;delete process.env.SMTP_HOST;
  const {sendEmail}=require('../utils/mailer');
  try{
    await sendEmail({to:'test@example.invalid',subject:'test',html:'<p>Hello</p>',text:'Hello'});
    process.env.SMTP_HOST='smtp.example.invalid';
    await sendEmail({to:'test@example.invalid',subject:'test',html:'<p>Hello</p>',text:'Hello'});
    assert.equal(sent.length,2);assert(sent.every(m=>m.text==='Hello'));
  }finally{if(previous===undefined)delete process.env.SMTP_HOST;else process.env.SMTP_HOST=previous;}
});
