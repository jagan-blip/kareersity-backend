const crypto = require("crypto");
let algorithm = "aes-256-ctr";
let password = "StCaErRaZaBnIoK2122TOSCD1S2N3A4E";
let iv = "K102I3n4aZbYCxDw";
const otpGenerator = require("otp-generator");
const sgMail = require("@sendgrid/mail");
const axios = require("axios");
var request = require("request");
const authkey = "eb7fae80000f0b9b";
//const SENDGRID_API_KEY = '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'
const SENDGRID_API_KEY =
  "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";
const backgroundUrl = "https://kareersity.s3.amazonaws.com/1693401728543.jpg";
module.exports = {
  encrypt: function (value) {
    let cipher = crypto.createCipheriv(algorithm, password, iv);
    let crypted = cipher.update(value, "utf8", "hex");
    crypted += cipher.final("hex");
    return crypted;
  },
  decrypt: function (value) {
    let decipher = crypto.createDecipheriv(algorithm, password, iv);
    let dec = decipher.update(value, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
  },
  GeneratePassword: (digit) => {
    return otpGenerator.generate(digit, {
      digits: true,
      lowerCaseAlphabets: true,
      upperCaseAlphabets: true,
      specialChars: true,
    });
  },
  SendEmail: (recipients, subj, sms) => {
    sgMail.setApiKey(SENDGRID_API_KEY);

    return new Promise((resolve, reject) => {
      const msg = {
        to: recipients,
        //cc: 'cs@meddtoday.com',
        from: "pankaj@cortexmarketing.in",
        subject: `${subj}`,
        text: "Welcome",
        html: `<div id="wrapper"
				style="background-color: white;min-height: 100%; font-family: 'Lato', sans-serif; line-height: 0px;background-color: #ffffff;font-size: 18px;max-width: 800px;margin: 0 auto;padding: 2%;color: #282828;min-height: 100%;overflow: auto; ">
		
		
		
		
		
				<div class="kareersityTeMP">
		
					<img src="https://kareersity.s3.ap-south-1.amazonaws.com/1691141123613.png ">
		
					<div style="padding: 20px; line-height: 20px;">
		
						<p>Hi</p>
		
						<p style="margin-left: 40px;">${sms}</p>
		
		
		
					</div>
		
				
		
					<div style="margin-left:0px;display: inline;">
		
						<a href="" target="_blank" style="margin:0px;"><img
								src="https://kareersity.s3.ap-south-1.amazonaws.com/1691141250321.png"></a>
		
						<a href="" target="_blank" style="margin:-5px;"><img
								src="https://kareersity.s3.ap-south-1.amazonaws.com/1691141169221.png"></a>
		
						<a href="" target="_blank" style="margin:-5px;"><img
								src="https://kareersity.s3.ap-south-1.amazonaws.com/1691141321243.png"></a>
		
						<a href="" target="_blank" style="margin:-5px;"><img
								src="https://kareersity.s3.ap-south-1.amazonaws.com/1691141357882.png"></a>
		
						<a href="" target="_blank" style="margin:-5px;"><img
								src="https://kareersity.s3.ap-south-1.amazonaws.com/1691141286482.png"></a>
		
						<a href="" target="_blank" style="margin-left:-25px;"><img
								src="https://kareersity.s3.amazonaws.com/1691142420722.png"></a>
		
					</div>
		
		
		
				</div>
		
			</div>`,
      };
      sgMail
        .send(msg)
        .then(() => {
          resolve("Email sent successfully"); // Resolve the Promise on success
        })
        .catch((err) => {
          reject(err); // Reject the Promise on error
        });
    });
  },
  krsCertTemp: (StudentName, CertificateDetail, TopicDetail, cgDate) => {
    return `<!DOCTYPE html>
		<html lang="en">
		
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Certificate Example</title>
			<link href="https://fonts.googleapis.com/css?family=Open+Sans|Pinyon+Script|Rochester" rel="stylesheet">
			<style>
			@page {
				size: landscape;
			}
				body {
					padding: 20px 0;
					background: #ccc;
				}
		
				.pm-certificate-container {
					position: relative;
					width: 985px;
					height: 677px;
					background-image:url(${backgroundUrl});
					background-size: cover;
					background-position: center;
					background-color: #618597;
					padding: 30px;
					color: #333;
					font-family: 'Open Sans', sans-serif;
					box-shadow: 0 0 5px rgba(0, 0, 0, .5);
					margin: 0 auto;
				}
						
				.admin-sign-image {
					position: absolute;
					top: 6%;
					left: 81%;
					transform: translate(-50%, -50%);
					width: 140px;
					height: 60px;
					z-index: 1;
				}
		
				.pm-certificate-block {
					width: 650px;
					height: 200px;
					position: relative;
					left: 50%;
					margin-left: -325px;
					top: 70px;
				}
		
				.pm-certificate-title {
					position: relative;
					top: 75px;
					text-align: center;
				}
		
				.pm-certificate-body {
					padding: 20px;
					text-align: center;
				}
		
				.pm-earned,
				.pm-course-title {
					margin: 15px 0 20px;
				}
		
				.pm-certified-1 {
					font-size: 12px;
					width: 86px;
				}
		
				.pm-certified-2 {
					font-size: 12px;
					width: auto;
					height: auto;
				}
		
				.pm-certified-3 {
					font-size: 12px;
					width: 168px;
					padding: 18px;
				}
		
				.underline {
					border-bottom: 3px solid #777;
					padding: 9px;
					margin-bottom: 7px;
				}
		
				.pm-empty-space {
					width: 75%;
					display: block;
				}
		
				.pm-certificate-footer {
					width: 595px;
					height: 100px;
					position: relative;
					left: 54%;
					margin-left: -327px;
					bottom: -270px;
					display: flex;
					flex-wrap: wrap;
					align-content: space-around;
					align-content: space-between;
					justify-content: space-between;
				}
		
				.pm-certificate-title.cursive h2 {
					font-size: 60px;
					line-height: 21px;
					margin-left: -6px;
					font-family: 'Pinyon Script';
		
				}
		
				.pm-name-text-before {
				   
					display: inline-block;
					margin: 0 12px;
					line-height: 1;
		
					font-size: 30px;
					color: green;
				}
		
				.pm-name-text.bold {
					margin-left: 5px;
					line-height: 1;
					font-size: 30px;
				}
		
				.pm-name-text-after {
					
					display: inline-block;
					margin: 0 12px;
					line-height: 1;
					font-size: 30px;
					color: green;
					/* Hide the actual bullet characters */
				} 
		
				.pm-student-name.bold.sans {
					font-size: 24px;
				}
		
				.pm-topic.bold {
		
					font-size: larger;
				}
		
				.pm-topic-detail.bold.sans {
		
					font-size: small;
				}
		
				/* Preserve the original font styles */
				.cursive {
					font-family: cursive;
					font-size: large;
				}
		
				.sans {
					font-family: 'Open Sans', sans-serif;
				}
		
				.bold {
					font-weight: bold;
				}
			</style>
		</head>
		
		<body>
			<div class="pm-certificate-container">
			
				<!-- <div class="outer-border"></div>
				<div class="inner-border"></div> -->
				<div class="pm-certificate-border">
					<div class="pm-certificate-title cursive">
						<h2>Certificate of Completion</h2>
					</div>
					<div class="pm-certificate-body">
						<div class="pm-certificate-block">
							<div class="pm-certificate-name underline-1">
								<span class="pm-name-text-before">• • •</span>
								<span class="pm-name-text bold">IS HEREBY AWARDED TO</span>
								<span class="pm-name-text-after">• • •</span>
							</div>
							<div class="pm-certificate-name underline">
								<!-- <span class="pm-earned-text cursive">has earned</span> -->
								<span class="pm-student-name bold sans">${StudentName}</span>
							</div>
							<div class="pm-course-title">
								<span class="pm-earned-text cursive">${CertificateDetail}</span>
								<!-- <span class="pm-credits-text bold sans">BPS PGS Initial PLO for Principals at Cluster
									Meetings</span> -->
							</div>
							<div class="pm-course-topic">
								<span class="pm-topic bold">Topic Covered</span><br />
								<span class="pm-topic-detail bold sans">${TopicDetail}</span>
							</div>
						</div>
						<div class="pm-certificate-footer">
							<div class="pm-certified-1">
								<span class="pm-credits-text bold sans">${cgDate}</span>
								<span class="pm-empty-space underline"></span>
								<span class="bold">DATE</span>
							</div>
							<div class="pm-certified-2">
								<!-- LEAVE EMPTY -->
							</div>
							<div class="pm-certified-3">
								<span class="pm-admin-sign">
									<img src="https://kareersity.s3.amazonaws.com/1693401767860.png" alt="admin-sign" class="admin-sign-image">
								</span>
								<span class="pm-empty-space underline"></span>
								<span class="bold">SANJAY SHARMA</span><br />
								<span class="bold">ACADEMIA MANAGER</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</body>
		
		</html>`;
  },
  SendMessage: (MobileNumber, Message) => {
    let data = {
      country_code: "+91",
      mobile: MobileNumber,
      sms: Message,
      // sid: "10797",
      sender: "KARSTY",
      pe_id: "1701170091089249833",
      template_id: "1707170238755589914",
    };

    const config = {
      method: "POST",
      url: "https://authkey.io/restapi/requestjson.php",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authkey}`,
      },
      data: JSON.stringify(data),
    };

    axios(config)
      // .then(function (response) {
      // 	console.log(response.data);
      // })
      .catch(function (error) {
        console.error(error);
      });
  },
  ReplacePlaceholders: (text, data) => {
    const placeholderRegex = /\\?\${([\w\d]+)}/g;

    const replacedText = text.replace(placeholderRegex, (match, key) => {
      return data[key] || match;
    });

    return replacedText;
  },
  UpdateTemplate: (template, data) => {
    const textToReplace = template.body;
    const ReplacePlaceholders = (text, data) => {
      const placeholderRegex = /\\?\${([\w\d]+)}/g;

      const replacedText = text.replace(placeholderRegex, (match, key) => {
        return data[key] || match;
      });

      return replacedText;
    };
    const replacedText = ReplacePlaceholders(textToReplace, data);

    template.body = replacedText;

    return template;
  },
};
