"""
Email Service for AgriConnect Platform
Handles all email notifications for farmers and dhalaris.

Features:
- Async/await pattern for non-blocking email sending
- Reusable sendEmail(to, subject, message) function
- Beautiful HTML email templates
- Comprehensive error handling with try/catch
"""

import asyncio
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from dotenv import load_dotenv

# Try to import aiosmtplib for async support, fallback to sync if not available
try:
    import aiosmtplib
    ASYNC_SMTP_AVAILABLE = True
except ImportError:
    ASYNC_SMTP_AVAILABLE = False

load_dotenv()

# ============== SMTP CONFIGURATION ==============
# Environment variables for SMTP config
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)
FROM_NAME = os.getenv("FROM_NAME", "AgriConnect")


# ============== CORE EMAIL FUNCTIONS ==============

def _create_email_message(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> MIMEMultipart:
    """Create an email message with HTML and optional text content."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"] = to_email

    # Add text and HTML parts
    if text_content:
        part1 = MIMEText(text_content, "plain")
        msg.attach(part1)
    
    part2 = MIMEText(html_content, "html")
    msg.attach(part2)
    
    return msg


async def send_email_async(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Send an email using async SMTP.
    Returns True if successful, False otherwise.
    Uses async/await pattern for non-blocking operation.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print("[EmailService] SMTP credentials not configured. Skipping email.")
        return False
    
    try:
        msg = _create_email_message(to_email, subject, html_content, text_content)
        
        if ASYNC_SMTP_AVAILABLE:
            # Async email sending
            await aiosmtplib.send(
                msg,
                hostname=SMTP_HOST,
                port=SMTP_PORT,
                username=SMTP_USER,
                password=SMTP_PASSWORD,
                start_tls=True
            )
        else:
            # Fallback to sync in thread pool
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: _send_email_sync(to_email, msg)
            )
        
        print(f"[EmailService] Email sent successfully to {to_email}")
        return True
    
    except Exception as e:
        print(f"[EmailService] Failed to send email to {to_email}: {e}")
        return False


def _send_email_sync(to_email: str, msg: MIMEMultipart) -> None:
    """Synchronous email sending helper."""
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(FROM_EMAIL, to_email, msg.as_string())


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Synchronous email sending function (for backward compatibility).
    Returns True if successful, False otherwise.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print("[EmailService] SMTP credentials not configured. Skipping email.")
        return False
    
    try:
        msg = _create_email_message(to_email, subject, html_content, text_content)
        
        # Connect and send
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())
        
        print(f"[EmailService] Email sent successfully to {to_email}")
        return True
    
    except Exception as e:
        print(f"[EmailService] Failed to send email to {to_email}: {e}")
        return False


# ============== REUSABLE SIMPLE EMAIL FUNCTION ==============

async def sendEmail(to: str, subject: str, message: str) -> bool:
    """
    Simple reusable function to send an email.
    
    Args:
        to: Recipient email address
        subject: Email subject line
        message: Email message (can be HTML or plain text)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    
    Example:
        await sendEmail("user@example.com", "Hello!", "Welcome to our platform!")
    """
    try:
        # Wrap message in base template for consistent styling
        html_content = get_base_template(f"""
            <div style="color: #475569; line-height: 1.6;">
                {message}
            </div>
        """)
        return await send_email_async(to, subject, html_content, message)
    except Exception as e:
        print(f"[EmailService] sendEmail failed: {e}")
        return False


def sendEmailSync(to: str, subject: str, message: str) -> bool:
    """
    Synchronous version of sendEmail for use in non-async contexts.
    
    Args:
        to: Recipient email address
        subject: Email subject line
        message: Email message (can be HTML or plain text)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        html_content = get_base_template(f"""
            <div style="color: #475569; line-height: 1.6;">
                {message}
            </div>
        """)
        return send_email(to, subject, html_content, message)
    except Exception as e:
        print(f"[EmailService] sendEmailSync failed: {e}")
        return False


# ============== EMAIL TEMPLATES ==============

def get_base_template(content: str, title: str = "AgriConnect") -> str:
    """Base HTML email template with styling."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🌾 AgriConnect</h1>
                    <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 14px;">Connecting Farmers & Traders</p>
                </td>
            </tr>
            <!-- Content -->
            <tr>
                <td style="padding: 40px 30px;">
                    {content}
                </td>
            </tr>
            <!-- Footer -->
            <tr>
                <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 12px; margin: 0;">
                        © 2026 AgriConnect. All rights reserved.<br>
                        This is an automated message. Please do not reply directly to this email.
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def get_email_button(text: str, url: str) -> str:
    """Generate a styled button for emails."""
    return f"""
    <div style="text-align: center; margin: 30px 0;">
        <a href="{url}" 
           style="background-color: #10b981; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            {text}
        </a>
    </div>
    """


# ============== DHALARI EMAILS ==============

def send_dhalari_welcome_email(email: str, name: str) -> bool:
    """Send welcome email when dhalari account is created."""
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Welcome to AgriConnect, {name}! 🎉</h2>
    <p style="color: #475569; line-height: 1.6;">
        Your trader account has been successfully created. You can now:
    </p>
    <ul style="color: #475569; line-height: 1.8;">
        <li>Browse crops listed by farmers</li>
        <li>Send deal requests to farmers</li>
        <li>Connect with farmers directly</li>
        <li>Track your deals and earnings</li>
    </ul>
    {get_email_button("Go to Dashboard", "http://localhost:3000/dhalari/dashboard")}
    <p style="color: #475569;">
        If you have any questions, feel free to contact our support team.
    </p>
    <p style="color: #475569; margin-top: 20px;">
        Best regards,<br>
        <strong>The AgriConnect Team</strong>
    </p>
    """
    return send_email(email, "Welcome to AgriConnect! 🌾", get_base_template(content))


async def send_dhalari_welcome_email_async(email: str, name: str) -> bool:
    """Async version: Send welcome email when dhalari account is created."""
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Welcome to AgriConnect, {name}! 🎉</h2>
    <p style="color: #475569; line-height: 1.6;">
        Your trader account has been successfully created. You can now:
    </p>
    <ul style="color: #475569; line-height: 1.8;">
        <li>Browse crops listed by farmers</li>
        <li>Send deal requests to farmers</li>
        <li>Connect with farmers directly</li>
        <li>Track your deals and earnings</li>
    </ul>
    {get_email_button("Go to Dashboard", "http://localhost:3000/dhalari/dashboard")}
    <p style="color: #475569;">
        If you have any questions, feel free to contact our support team.
    </p>
    <p style="color: #475569; margin-top: 20px;">
        Best regards,<br>
        <strong>The AgriConnect Team</strong>
    </p>
    """
    return await send_email_async(email, "Welcome to AgriConnect! 🌾", get_base_template(content))


def send_dhalari_profile_updated_email(email: str, name: str) -> bool:
    """Send confirmation email when dhalari updates their profile."""
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Profile Updated Successfully! ✅</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        Your profile has been updated successfully. Your updated business information is now visible to farmers on the platform.
    </p>
    <p style="color: #475569; line-height: 1.6;">
        A complete profile helps farmers trust you and increases your chances of successful deals.
    </p>
    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #166534; margin: 0;">
            💡 <strong>Tip:</strong> Keep your phone number and business details up to date for better connectivity with farmers.
        </p>
    </div>
    {get_email_button("View Profile", "http://localhost:3000/dhalari/profile")}
    """
    return send_email(email, "Profile Updated - AgriConnect 🌾", get_base_template(content))


async def send_dhalari_profile_updated_email_async(email: str, name: str) -> bool:
    """Async version: Send confirmation email when dhalari updates their profile."""
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Profile Updated Successfully! ✅</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        Your profile has been updated successfully. Your updated business information is now visible to farmers on the platform.
    </p>
    <p style="color: #475569; line-height: 1.6;">
        A complete profile helps farmers trust you and increases your chances of successful deals.
    </p>
    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #166534; margin: 0;">
            💡 <strong>Tip:</strong> Keep your phone number and business details up to date for better connectivity with farmers.
        </p>
    </div>
    {get_email_button("View Profile", "http://localhost:3000/dhalari/profile")}
    """
    return await send_email_async(email, "Profile Updated - AgriConnect 🌾", get_base_template(content))


def send_deal_status_email_to_dhalari(
    email: str, 
    dhalari_name: str,
    farmer_name: str,
    crop_name: str,
    quantity: float,
    price: float,
    status: str  # "accepted" or "declined"
) -> bool:
    """Send email to dhalari when farmer accepts/declines their deal request."""
    is_accepted = status.lower() == "accepted"
    status_color = "#10b981" if is_accepted else "#ef4444"
    status_text = "Accepted ✅" if is_accepted else "Declined ❌"
    
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Deal Request Update</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {dhalari_name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        Your deal request has been <strong style="color: {status_color};">{status_text}</strong> by the farmer.
    </p>
    
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin: 0 0 15px 0;">📋 Deal Details</h3>
        <table style="width: 100%; color: #475569;">
            <tr>
                <td style="padding: 8px 0;"><strong>Farmer:</strong></td>
                <td style="padding: 8px 0;">{farmer_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Crop:</strong></td>
                <td style="padding: 8px 0;">{crop_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Quantity:</strong></td>
                <td style="padding: 8px 0;">{quantity} kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Price:</strong></td>
                <td style="padding: 8px 0;">₹{price}/kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Total Value:</strong></td>
                <td style="padding: 8px 0; font-weight: bold; color: #10b981;">₹{quantity * price:,.2f}</td>
            </tr>
        </table>
    </div>
    
    {"<p style='color: #475569;'>You can now contact the farmer to proceed with the deal. Check your dashboard for contact details.</p>" if is_accepted else "<p style='color: #475569;'>Don't worry! There are many other farmers on our platform. Keep exploring!</p>"}
    
    {get_email_button("View Dashboard", "http://localhost:3000/dhalari/dashboard")}
    """
    
    subject = f"Deal Request {status_text} - {crop_name}"
    return send_email(email, subject, get_base_template(content))


async def send_deal_status_email_to_dhalari_async(
    email: str, 
    dhalari_name: str,
    farmer_name: str,
    crop_name: str,
    quantity: float,
    price: float,
    status: str
) -> bool:
    """Async version: Send email to dhalari when farmer accepts/declines their deal request."""
    is_accepted = status.lower() == "accepted"
    status_color = "#10b981" if is_accepted else "#ef4444"
    status_text = "Accepted ✅" if is_accepted else "Declined ❌"
    
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Deal Request Update</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {dhalari_name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        Your deal request has been <strong style="color: {status_color};">{status_text}</strong> by the farmer.
    </p>
    
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin: 0 0 15px 0;">📋 Deal Details</h3>
        <table style="width: 100%; color: #475569;">
            <tr>
                <td style="padding: 8px 0;"><strong>Farmer:</strong></td>
                <td style="padding: 8px 0;">{farmer_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Crop:</strong></td>
                <td style="padding: 8px 0;">{crop_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Quantity:</strong></td>
                <td style="padding: 8px 0;">{quantity} kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Price:</strong></td>
                <td style="padding: 8px 0;">₹{price}/kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Total Value:</strong></td>
                <td style="padding: 8px 0; font-weight: bold; color: #10b981;">₹{quantity * price:,.2f}</td>
            </tr>
        </table>
    </div>
    
    {"<p style='color: #475569;'>You can now contact the farmer to proceed with the deal. Check your dashboard for contact details.</p>" if is_accepted else "<p style='color: #475569;'>Don't worry! There are many other farmers on our platform. Keep exploring!</p>"}
    
    {get_email_button("View Dashboard", "http://localhost:3000/dhalari/dashboard")}
    """
    
    subject = f"Deal Request {status_text} - {crop_name}"
    return await send_email_async(email, subject, get_base_template(content))


def send_contact_response_email_to_dhalari(
    email: str,
    dhalari_name: str,
    farmer_name: str,
    farmer_phone: str,
    status: str
) -> bool:
    """Send email to dhalari when farmer responds to contact request."""
    is_accepted = status.lower() == "accepted"
    status_color = "#10b981" if is_accepted else "#ef4444"
    status_text = "Accepted ✅" if is_accepted else "Declined ❌"
    
    contact_section = ""
    if is_accepted:
        contact_section = f"""
        <div style='background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0;'>
            <h3 style='color: #166534; margin: 0 0 10px 0;'>📞 Contact Details</h3>
            <p style='color: #166534; font-size: 18px; margin: 0;'><strong>{farmer_name}:</strong> {farmer_phone}</p>
        </div>
        """
    
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Contact Request Update</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {dhalari_name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        Your contact request has been <strong style="color: {status_color};">{status_text}</strong> by {farmer_name}.
    </p>
    
    {contact_section}
    
    {get_email_button("Find More Farmers", "http://localhost:3000/dhalari/farmers")}
    """
    
    subject = f"Contact Request {status_text} - {farmer_name}"
    return send_email(email, subject, get_base_template(content))


async def send_contact_response_email_to_dhalari_async(
    email: str,
    dhalari_name: str,
    farmer_name: str,
    farmer_phone: str,
    status: str
) -> bool:
    """Async version: Send email to dhalari when farmer responds to contact request."""
    is_accepted = status.lower() == "accepted"
    status_color = "#10b981" if is_accepted else "#ef4444"
    status_text = "Accepted ✅" if is_accepted else "Declined ❌"
    
    contact_section = ""
    if is_accepted:
        contact_section = f"""
        <div style='background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0;'>
            <h3 style='color: #166534; margin: 0 0 10px 0;'>📞 Contact Details</h3>
            <p style='color: #166534; font-size: 18px; margin: 0;'><strong>{farmer_name}:</strong> {farmer_phone}</p>
        </div>
        """
    
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Contact Request Update</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {dhalari_name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        Your contact request has been <strong style="color: {status_color};">{status_text}</strong> by {farmer_name}.
    </p>
    
    {contact_section}
    
    {get_email_button("Find More Farmers", "http://localhost:3000/dhalari/farmers")}
    """
    
    subject = f"Contact Request {status_text} - {farmer_name}"
    return await send_email_async(email, subject, get_base_template(content))


# ============== FARMER EMAILS ==============

def send_farmer_profile_updated_email(email: str, name: str) -> bool:
    """Send email when farmer updates their profile."""
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Profile Updated Successfully! ✅</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        Your profile has been updated successfully. Your updated information is now visible to traders on the platform.
    </p>
    <p style="color: #475569; line-height: 1.6;">
        A complete profile helps traders find you more easily and builds trust for better deals.
    </p>
    {get_email_button("View Profile", "http://localhost:3000/farmer/profile")}
    """
    return send_email(email, "Profile Updated - AgriConnect 🌾", get_base_template(content))


async def send_farmer_profile_updated_email_async(email: str, name: str) -> bool:
    """Async version: Send email when farmer updates their profile."""
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Profile Updated Successfully! ✅</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        Your profile has been updated successfully. Your updated information is now visible to traders on the platform.
    </p>
    <p style="color: #475569; line-height: 1.6;">
        A complete profile helps traders find you more easily and builds trust for better deals.
    </p>
    {get_email_button("View Profile", "http://localhost:3000/farmer/profile")}
    """
    return await send_email_async(email, "Profile Updated - AgriConnect 🌾", get_base_template(content))


def send_new_deal_request_email_to_farmer(
    email: str,
    farmer_name: str,
    dhalari_name: str,
    dhalari_phone: str,
    crop_name: str,
    quantity: float,
    price: float,
    message: str = ""
) -> bool:
    """Send email to farmer when dhalari sends a deal request."""
    message_section = ""
    if message:
        message_section = f"""
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <strong>Message:</strong>
            <p style="color: #64748b; font-style: italic; margin: 5px 0 0 0;">"{message}"</p>
        </div>
        """
    
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">New Deal Request! 🤝</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {farmer_name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        Great news! A trader is interested in purchasing your crop.
    </p>
    
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin: 0 0 15px 0;">📋 Request Details</h3>
        <table style="width: 100%; color: #475569;">
            <tr>
                <td style="padding: 8px 0;"><strong>Trader:</strong></td>
                <td style="padding: 8px 0;">{dhalari_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0;">{dhalari_phone}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Crop:</strong></td>
                <td style="padding: 8px 0;">{crop_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Quantity:</strong></td>
                <td style="padding: 8px 0;">{quantity} kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Offered Price:</strong></td>
                <td style="padding: 8px 0;">₹{price}/kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Total Value:</strong></td>
                <td style="padding: 8px 0; font-weight: bold; color: #10b981;">₹{quantity * price:,.2f}</td>
            </tr>
        </table>
        {message_section}
    </div>
    
    <p style="color: #475569; line-height: 1.6;">
        Please review this request and accept or decline it from your dashboard.
    </p>
    
    {get_email_button("View Request", "http://localhost:3000/farmer/dealer-requests")}
    """
    
    subject = f"New Deal Request for {crop_name} - ₹{quantity * price:,.0f}"
    return send_email(email, subject, get_base_template(content))


async def send_new_deal_request_email_to_farmer_async(
    email: str,
    farmer_name: str,
    dhalari_name: str,
    dhalari_phone: str,
    crop_name: str,
    quantity: float,
    price: float,
    message: str = ""
) -> bool:
    """Async version: Send email to farmer when dhalari sends a deal request."""
    message_section = ""
    if message:
        message_section = f"""
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <strong>Message:</strong>
            <p style="color: #64748b; font-style: italic; margin: 5px 0 0 0;">"{message}"</p>
        </div>
        """
    
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">New Deal Request! 🤝</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {farmer_name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        Great news! A trader is interested in purchasing your crop.
    </p>
    
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin: 0 0 15px 0;">📋 Request Details</h3>
        <table style="width: 100%; color: #475569;">
            <tr>
                <td style="padding: 8px 0;"><strong>Trader:</strong></td>
                <td style="padding: 8px 0;">{dhalari_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0;">{dhalari_phone}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Crop:</strong></td>
                <td style="padding: 8px 0;">{crop_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Quantity:</strong></td>
                <td style="padding: 8px 0;">{quantity} kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Offered Price:</strong></td>
                <td style="padding: 8px 0;">₹{price}/kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Total Value:</strong></td>
                <td style="padding: 8px 0; font-weight: bold; color: #10b981;">₹{quantity * price:,.2f}</td>
            </tr>
        </table>
        {message_section}
    </div>
    
    <p style="color: #475569; line-height: 1.6;">
        Please review this request and accept or decline it from your dashboard.
    </p>
    
    {get_email_button("View Request", "http://localhost:3000/farmer/dealer-requests")}
    """
    
    subject = f"New Deal Request for {crop_name} - ₹{quantity * price:,.0f}"
    return await send_email_async(email, subject, get_base_template(content))


def send_contact_request_email_to_farmer(
    email: str,
    farmer_name: str,
    dhalari_name: str,
    dhalari_phone: str,
    message: str = ""
) -> bool:
    """Send email to farmer when dhalari sends a contact request."""
    message_section = ""
    if message:
        message_section = f"""
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #93c5fd;">
            <strong>Message:</strong>
            <p style="color: #3b82f6; font-style: italic; margin: 5px 0 0 0;">"{message}"</p>
        </div>
        """
    
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">New Contact Request! 📞</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {farmer_name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        A trader wants to connect with you!
    </p>
    
    <div style="background-color: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin: 0 0 15px 0;">👤 Trader Details</h3>
        <p style="color: #1e40af; margin: 5px 0;"><strong>Name:</strong> {dhalari_name}</p>
        <p style="color: #1e40af; margin: 5px 0;"><strong>Phone:</strong> {dhalari_phone}</p>
        {message_section}
    </div>
    
    <p style="color: #475569; line-height: 1.6;">
        Accept this request to share your contact details with the trader.
    </p>
    
    {get_email_button("View Request", "http://localhost:3000/farmer/dealer-requests")}
    """
    
    return send_email(email, f"Contact Request from {dhalari_name}", get_base_template(content))


async def send_contact_request_email_to_farmer_async(
    email: str,
    farmer_name: str,
    dhalari_name: str,
    dhalari_phone: str,
    message: str = ""
) -> bool:
    """Async version: Send email to farmer when dhalari sends a contact request."""
    message_section = ""
    if message:
        message_section = f"""
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #93c5fd;">
            <strong>Message:</strong>
            <p style="color: #3b82f6; font-style: italic; margin: 5px 0 0 0;">"{message}"</p>
        </div>
        """
    
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">New Contact Request! 📞</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {farmer_name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        A trader wants to connect with you!
    </p>
    
    <div style="background-color: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin: 0 0 15px 0;">👤 Trader Details</h3>
        <p style="color: #1e40af; margin: 5px 0;"><strong>Name:</strong> {dhalari_name}</p>
        <p style="color: #1e40af; margin: 5px 0;"><strong>Phone:</strong> {dhalari_phone}</p>
        {message_section}
    </div>
    
    <p style="color: #475569; line-height: 1.6;">
        Accept this request to share your contact details with the trader.
    </p>
    
    {get_email_button("View Request", "http://localhost:3000/farmer/dealer-requests")}
    """
    
    return await send_email_async(email, f"Contact Request from {dhalari_name}", get_base_template(content))


def send_crop_added_email(email: str, farmer_name: str, crop_name: str, quantity: float, price: float) -> bool:
    """Send email when farmer adds a new crop listing."""
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Crop Listed Successfully! 🌱</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {farmer_name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        Your crop has been successfully listed on the marketplace!
    </p>
    
    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #166534; margin: 0 0 15px 0;">🌾 Crop Details</h3>
        <table style="width: 100%; color: #166534;">
            <tr>
                <td style="padding: 8px 0;"><strong>Crop:</strong></td>
                <td style="padding: 8px 0;">{crop_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Quantity:</strong></td>
                <td style="padding: 8px 0;">{quantity} kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Expected Price:</strong></td>
                <td style="padding: 8px 0;">₹{price}/kg</td>
            </tr>
        </table>
    </div>
    
    <p style="color: #475569; line-height: 1.6;">
        Traders can now see your crop and send you deal requests. Keep your profile updated for better visibility!
    </p>
    
    {get_email_button("View My Crops", "http://localhost:3000/farmer/my-crops")}
    """
    
    return send_email(email, f"Crop Listed: {crop_name} 🌾", get_base_template(content))


async def send_crop_added_email_async(email: str, farmer_name: str, crop_name: str, quantity: float, price: float) -> bool:
    """Async version: Send email when farmer adds a new crop listing."""
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Crop Listed Successfully! 🌱</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {farmer_name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        Your crop has been successfully listed on the marketplace!
    </p>
    
    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #166534; margin: 0 0 15px 0;">🌾 Crop Details</h3>
        <table style="width: 100%; color: #166534;">
            <tr>
                <td style="padding: 8px 0;"><strong>Crop:</strong></td>
                <td style="padding: 8px 0;">{crop_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Quantity:</strong></td>
                <td style="padding: 8px 0;">{quantity} kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Expected Price:</strong></td>
                <td style="padding: 8px 0;">₹{price}/kg</td>
            </tr>
        </table>
    </div>
    
    <p style="color: #475569; line-height: 1.6;">
        Traders can now see your crop and send you deal requests. Keep your profile updated for better visibility!
    </p>
    
    {get_email_button("View My Crops", "http://localhost:3000/farmer/my-crops")}
    """
    
    return await send_email_async(email, f"Crop Listed: {crop_name} 🌾", get_base_template(content))


def send_deal_accepted_email_to_farmer(
    email: str,
    farmer_name: str,
    dhalari_name: str,
    dhalari_phone: str,
    crop_name: str,
    quantity: float,
    price: float
) -> bool:
    """Send confirmation email to farmer after accepting a deal."""
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Deal Confirmed! 🎉</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {farmer_name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        You have successfully accepted a deal. Here are the details:
    </p>
    
    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #166534; margin: 0 0 15px 0;">✅ Deal Confirmed</h3>
        <table style="width: 100%; color: #166534;">
            <tr>
                <td style="padding: 8px 0;"><strong>Trader:</strong></td>
                <td style="padding: 8px 0;">{dhalari_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Trader Phone:</strong></td>
                <td style="padding: 8px 0;">{dhalari_phone}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Crop:</strong></td>
                <td style="padding: 8px 0;">{crop_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Quantity:</strong></td>
                <td style="padding: 8px 0;">{quantity} kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Price:</strong></td>
                <td style="padding: 8px 0;">₹{price}/kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Total Amount:</strong></td>
                <td style="padding: 8px 0; font-size: 18px; font-weight: bold;">₹{quantity * price:,.2f}</td>
            </tr>
        </table>
    </div>
    
    <p style="color: #475569; line-height: 1.6;">
        The trader has been notified and may contact you soon to proceed with the deal. 
        Contact them at <strong>{dhalari_phone}</strong> if needed.
    </p>
    
    {get_email_button("Go to Dashboard", "http://localhost:3000/farmer/dashboard")}
    """
    
    return send_email(email, f"Deal Confirmed: {crop_name} - ₹{quantity * price:,.0f} 🎉", get_base_template(content))


async def send_deal_accepted_email_to_farmer_async(
    email: str,
    farmer_name: str,
    dhalari_name: str,
    dhalari_phone: str,
    crop_name: str,
    quantity: float,
    price: float
) -> bool:
    """Async version: Send confirmation email to farmer after accepting a deal."""
    content = f"""
    <h2 style="color: #1e293b; margin: 0 0 20px 0;">Deal Confirmed! 🎉</h2>
    <p style="color: #475569; line-height: 1.6;">
        Hi {farmer_name},
    </p>
    <p style="color: #475569; line-height: 1.6;">
        You have successfully accepted a deal. Here are the details:
    </p>
    
    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #166534; margin: 0 0 15px 0;">✅ Deal Confirmed</h3>
        <table style="width: 100%; color: #166534;">
            <tr>
                <td style="padding: 8px 0;"><strong>Trader:</strong></td>
                <td style="padding: 8px 0;">{dhalari_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Trader Phone:</strong></td>
                <td style="padding: 8px 0;">{dhalari_phone}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Crop:</strong></td>
                <td style="padding: 8px 0;">{crop_name}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Quantity:</strong></td>
                <td style="padding: 8px 0;">{quantity} kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Price:</strong></td>
                <td style="padding: 8px 0;">₹{price}/kg</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Total Amount:</strong></td>
                <td style="padding: 8px 0; font-size: 18px; font-weight: bold;">₹{quantity * price:,.2f}</td>
            </tr>
        </table>
    </div>
    
    <p style="color: #475569; line-height: 1.6;">
        The trader has been notified and may contact you soon to proceed with the deal. 
        Contact them at <strong>{dhalari_phone}</strong> if needed.
    </p>
    
    {get_email_button("Go to Dashboard", "http://localhost:3000/farmer/dashboard")}
    """
    
    return await send_email_async(email, f"Deal Confirmed: {crop_name} - ₹{quantity * price:,.0f} 🎉", get_base_template(content))
