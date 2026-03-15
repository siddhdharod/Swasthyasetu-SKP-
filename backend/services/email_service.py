import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

def send_otp_email(email: str, otp: str):
    try:
        msg = MIMEMultipart()
        msg['From'] = Config.SMTP_EMAIL
        msg['To'] = email
        msg['Subject'] = "SwasthyaSetu AI - Your Verification Code"
        
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #A259FF;">SwasthyaSetu AI</h2>
                    <p>Welcome to SwasthyaSetu AI. Please use the following code to complete your login:</p>
                    <div style="font-size: 32px; font-weight: bold; color: #FF7AAE; text-align: center; padding: 20px; letter-spacing: 5px;">
                        {otp}
                    </div>
                    <p>This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #777;">&copy; 2026 SwasthyaSetu AI. Secure Healthcare Solutions.</p>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT)
        server.starttls()
        server.login(Config.SMTP_EMAIL, Config.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
