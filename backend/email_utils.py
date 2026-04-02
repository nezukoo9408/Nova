import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

# Set up simple logging for the email utility
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, html_body: str):
    """
    Synchronous email sender. Intended to be run using FastAPI BackgroundTasks to prevent blocking the API.
    """
    try:
        # Load credentials dynamically
        from dotenv import load_dotenv
        load_dotenv(override=True)
        
        email_host = os.getenv("EMAIL_HOST", "smtp.gmail.com")
        email_port = int(os.getenv("EMAIL_PORT", 465))  # Default to 465 for SSL instead of 587
        email_user = os.getenv("EMAIL_USER", "")
        email_password = os.getenv("EMAIL_PASSWORD", "")

        if not email_user or not email_password:
            logger.warning(f"Email credentials not configured. Skipping email to {to_email}")
            return

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Nova Bus Booking <{email_user}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        # Use SMTP_SSL for more robust connection on restricted networks
        if email_port == 465:
            server = smtplib.SMTP_SSL(email_host, email_port)
        else:
            server = smtplib.SMTP(email_host, email_port)
            server.starttls()
            
        server.login(email_user, email_password)
        server.send_message(msg)
        server.quit()
        logger.info(f"✅ Successfully sent email to {to_email}")
    except Exception as e:
        logger.error(f"❌ Failed to send email to {to_email}: {e}")

# --- HTML Email Templates ---

def get_base_html(title, content):
    return f"""
    <html>
    <head>
      <style>
        body {{ font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background-color: #f0f2f5; color: #1e293b; margin: 0; padding: 40px 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }}
        .header {{ background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center; color: #ffffff; }}
        .header h1 {{ margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }}
        .ticket-icon {{ font-size: 48px; margin-bottom: 10px; display: block; }}
        .content {{ padding: 35px; line-height: 1.7; }}
        .welcome-text {{ font-size: 18px; color: #475569; margin-bottom: 25px; }}
        .welcome-text strong {{ color: #1e293b; }}
        .details-card {{ background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 25px; margin: 25px 0; position: relative; }}
        .details-card::before, .details-card::after {{ content: ''; position: absolute; width: 20px; height: 20px; background-color: #ffffff; border-radius: 50%; top: 50%; margin-top: -10px; border: 1px solid #cbd5e1; }}
        .details-card::before {{ left: -11px; }}
        .details-card::after {{ right: -11px; }}
        .detail-item {{ margin-bottom: 18px; display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }}
        .detail-item:last-child {{ border-bottom: none; }}
        .label {{ font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }}
        .value {{ font-size: 15px; font-weight: 600; color: #0f172a; text-align: right; }}
        .highlight {{ color: #4f46e5; font-weight: 700; }}
        .footer {{ text-align: center; padding: 25px; font-size: 13px; color: #64748b; background-color: #f8fafc; border-top: 1px solid #f1f5f9; }}
        .btn {{ display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="ticket-icon">🚌</span>
          <h1>{title}</h1>
        </div>
        <div class="content">
          {content}
          <div style="text-align: center;">
            <a href="#" class="btn">View on Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <strong>Nova Bus Network</strong><br>
          Connecting people, one journey at a time.<br>
          &copy; 2026 Nova Inc.
        </div>
      </div>
    </body>
    </html>
    """

def template_booking_confirmation(name, email, route_from, route_to, date, seat, bus_type, amount, booking_id):
    content = f"""
    <p class="welcome-text">Hi <strong>{name}</strong>,</p>
    <p>Get ready for your trip! Your booking is confirmed. Below are your electronic ticket details.</p>
    
    <div class="details-card">
      <div class="detail-item">
        <span class="label">Ticket Number</span>
        <span class="value highlight">#NV{booking_id:06d}</span>
      </div>
      <div class="detail-item">
        <span class="label">From</span>
        <span class="value">{route_from}</span>
      </div>
      <div class="detail-item">
        <span class="label">To</span>
        <span class="value">{route_to}</span>
      </div>
      <div class="detail-item">
        <span class="label">Departure</span>
        <span class="value">{date}</span>
      </div>
      <div class="detail-item">
        <span class="label">Seat Number</span>
        <span class="value">{seat}</span>
      </div>
      <div class="detail-item">
        <span class="label">Bus Type</span>
        <span class="value">{bus_type}</span>
      </div>
      <div class="detail-item">
        <span class="label">Amount Paid</span>
        <span class="value">₹{amount}</span>
      </div>
    </div>
    <p style="font-size: 14px; color: #64748b;">Please carry a valid ID proof during your journey. We recommend arriving 15 minutes before departure.</p>
    """
    return get_base_html("Booking Confirmed", content)


def template_waiting_list(name, route_from, route_to, date, position, amount):
    content = f"""
    <p class="welcome-text">Hi <strong>{name}</strong>,</p>
    <p>You have joined the waiting list for this route. Seats are allocated automatically if a cancellation occurs.</p>
    
    <div class="details-card">
      <div class="detail-item">
        <span class="label">Route</span>
        <span class="value">{route_from} &rarr; {route_to}</span>
      </div>
      <div class="detail-item">
        <span class="label">Journey Date</span>
        <span class="value">{date}</span>
      </div>
      <div class="detail-item">
        <span class="label">Waitlist Position</span>
        <span class="value highlight">#{position}</span>
      </div>
      <div class="detail-item">
        <span class="label">Amount Held</span>
        <span class="value">₹{amount}</span>
      </div>
    </div>
    <p style="font-size: 14px; color: #64748b;">If your seat is not confirmed before departure, a full refund will be processed automatically.</p>
    """
    return get_base_html("Waitlist Confirmation", content)


def template_cancellation(name, route_from, route_to, date, seat, is_waitlist, tracking_id):
    content = f"""
    <p class="welcome-text">Hi <strong>{name}</strong>,</p>
    <p>Your {"waitlist request" if is_waitlist else "ticket"} has been successfully cancelled as per your request.</p>
    
    <div class="details-card">
      <div class="detail-item">
        <span class="label">{"Waitlist ID" if is_waitlist else "Booking ID"}</span>
        <span class="value">#{tracking_id}</span>
      </div>
      <div class="detail-item">
        <span class="label">Route</span>
        <span class="value">{route_from} &rarr; {route_to}</span>
      </div>
      <div class="detail-item">
        <span class="label">Travel Date</span>
        <span class="value">{date}</span>
      </div>
      {f'''<div class="detail-item">
        <span class="label">Seat(s)</span>
        <span class="value">{seat}</span>
      </div>''' if seat else ''}
      <div class="detail-item">
        <span class="label">Refund Status</span>
        <span class="value highlight">Initiated</span>
      </div>
    </div>
    <p style="font-size: 14px; color: #64748b;">The refund amount will be credited to your original payment method within 3-5 business days. We hope to see you again!</p>
    """
    return get_base_html("Cancellation Confirmed", content)


def template_waitlist_confirmed(name, route_from, route_to, date, seat, bus_type):
    content = f"""
    <p class="welcome-text">Hi <strong>{name}</strong>,</p>
    <p>Great news! Your waitlist ticket has been <strong>confirmed</strong>. A seat has been allocated for your journey.</p>
    
    <div class="details-card">
      <div class="detail-item">
        <span class="label">Assigned Seat</span>
        <span class="value highlight">{seat}</span>
      </div>
      <div class="detail-item">
        <span class="label">Route</span>
        <span class="value">{route_from} &rarr; {route_to}</span>
      </div>
      <div class="detail-item">
        <span class="label">Travel Date</span>
        <span class="value">{date}</span>
      </div>
      <div class="detail-item">
        <span class="label">Bus Type</span>
        <span class="value">{bus_type}</span>
      </div>
    </div>
    <p style="font-size: 14px; color: #64748b;">You can now view and download your full ticket from the dashboard.</p>
    """
    return get_base_html("Seat Confirmed!", content)
