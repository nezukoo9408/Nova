import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

# Set up simple logging for the email utility
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")

def send_email(to_email: str, subject: str, html_body: str):
    """
    Synchronous email sender. Intended to be run using FastAPI BackgroundTasks to prevent blocking the API.
    """
    if not EMAIL_USER or not EMAIL_PASSWORD:
        logger.warning(f"Email credentials not configured (EMAIL_USER/EMAIL_PASSWORD). Skipping email to {to_email} (Subject: {subject})")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Nova Bus Booking <{EMAIL_USER}>"
    msg["To"] = to_email

    # Add HTML body
    part = MIMEText(html_body, "html")
    msg.attach(part)

    try:
        # Connect to SMTP server
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        logger.info(f"✅ Successfully sent email to {to_email}: {subject}")
        print(f"✅ Email sent successfully to {to_email} (Subject: {subject})")
    except Exception as e:
        logger.error(f"❌ Failed to send email to {to_email}: {e}")
        print(f"❌ Failed to send email to {to_email}: {e}")

# --- HTML Email Templates ---

def get_base_html(title, content):
    return f"""
    <html>
    <head>
      <style>
        body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4fa; color: #333; margin: 0; padding: 20px; }}
        .container {{ max-w-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
        .header {{ background-color: #1a1a2e; padding: 30px; text-align: center; border-bottom: 4px solid #b58ce8; }}
        .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }}
        .content {{ padding: 30px; line-height: 1.6; }}
        .details-box {{ background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }}
        .detail-row {{ margin-bottom: 10px; }}
        .detail-label {{ font-weight: bold; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }}
        .detail-value {{ font-weight: 600; color: #0f172a; font-size: 16px; margin-top: 2px; }}
        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>{title}</h1>
        </div>
        <div class="content">
          {content}
        </div>
        <div class="footer">
          &copy; 2026 Nova Bus Network. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    """

def template_booking_confirmation(name, email, route_from, route_to, date, seat, bus_type, amount, booking_id):
    content = f"""
    <p>Hi <strong>{name}</strong>,</p>
    <p>Your seat has been successfully booked. Have a safe journey!</p>
    
    <div class="details-box">
      <div class="detail-row">
        <div class="detail-label">Booking ID</div>
        <div class="detail-value">#{booking_id}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Route</div>
        <div class="detail-value">{route_from} &rarr; {route_to}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Journey Date & Time</div>
        <div class="detail-value">{date}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Seat(s)</div>
        <div class="detail-value">{seat}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Bus Type</div>
        <div class="detail-value">{bus_type}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Amount Paid</div>
        <div class="detail-value">₹{amount}</div>
      </div>
    </div>
    """
    return get_base_html("Nova Booking Confirmation 🎟️", content)


def template_waiting_list(name, route_from, route_to, date, position, amount):
    content = f"""
    <p>Hi <strong>{name}</strong>,</p>
    <p>You are currently on the waitlist. If a seat becomes available, it will be automatically assigned to you.</p>
    
    <div class="details-box">
      <div class="detail-row">
        <div class="detail-label">Route</div>
        <div class="detail-value">{route_from} &rarr; {route_to}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Journey Date & Time</div>
        <div class="detail-value">{date}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Waitlist Position</div>
        <div class="detail-value">#{position}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Amount Paid</div>
        <div class="detail-value">₹{amount}</div>
      </div>
    </div>
    """
    return get_base_html("Nova Waitlist Confirmation ⏳", content)


def template_cancellation(name, route_from, route_to, date, seat, is_waitlist, tracking_id):
    content = f"""
    <p>Hi <strong>{name}</strong>,</p>
    <p>Your {"waitlist request" if is_waitlist else "ticket"} has been successfully cancelled.</p>
    <p>Your refund will be processed within 3&ndash;4 working days. We hope to serve you again soon.</p>
    
    <div class="details-box">
      <div class="detail-row">
        <div class="detail-label">{"Waitlist ID" if is_waitlist else "Booking ID"}</div>
        <div class="detail-value">#{tracking_id}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Route</div>
        <div class="detail-value">{route_from} &rarr; {route_to}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Journey Date & Time</div>
        <div class="detail-value">{date}</div>
      </div>
      {f'''<div class="detail-row">
        <div class="detail-label">Seat(s)</div>
        <div class="detail-value">{seat}</div>
      </div>''' if seat else ''}
    </div>
    """
    return get_base_html("Nova Ticket Cancellation ❌", content)


def template_waitlist_confirmed(name, route_from, route_to, date, seat, bus_type):
    content = f"""
    <p>Hi <strong>{name}</strong>,</p>
    <p>Good news! Your waitlist ticket has been confirmed. Your seat has now been allocated. Have a great journey!</p>
    
    <div class="details-box">
      <div class="detail-row">
        <div class="detail-label">Route</div>
        <div class="detail-value">{route_from} &rarr; {route_to}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Journey Date & Time</div>
        <div class="detail-value">{date}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Assigned Seat(s)</div>
        <div class="detail-value">{seat}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Bus Type</div>
        <div class="detail-value">{bus_type}</div>
      </div>
    </div>
    """
    return get_base_html("Nova Seat Confirmed 🎉", content)
