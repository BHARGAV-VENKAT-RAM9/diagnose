import json
import urllib.request
import urllib.error
from app.config import settings

def send_brevo_sms(recipient: str, content: str) -> bool:
    """
    Sends a transactional SMS using Brevo's HTTP API.
    Does not depend on external Python libraries.
    """
    api_key = settings.BREVO_API_KEY
    if not api_key or api_key == "placeholder":
        print(f"[MOCK SMS] To {recipient}: {content}")
        return True

    # Normalize phone number to include country code (default to 91 for India if 10 digits)
    clean_phone = "".join(c for c in recipient if c.isdigit())
    if len(clean_phone) == 10:
        clean_phone = "91" + clean_phone
    elif len(clean_phone) == 12 and clean_phone.startswith("91"):
        pass
    else:
        # Standard fallback format
        clean_phone = clean_phone

    url = "https://api.brevo.com/v3/transactionalSMS/sms"
    headers = {
        "api-key": api_key,
        "content-type": "application/json",
        "accept": "application/json"
    }
    payload = {
        "sender": "VickyDiag",
        "recipient": clean_phone,
        "content": content
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            response_body = response.read().decode("utf-8")
            print(f"Brevo SMS sent successfully to {clean_phone}: {response_body}")
            return True
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"HTTP Error sending SMS to {clean_phone}: {e.code} - {error_body}")
        return False
    except Exception as e:
        print(f"Unexpected error sending SMS to {clean_phone}: {e}")
        return False

def send_otp_sms(phone: str, otp: str) -> bool:
    """Sends OTP verification code to patient."""
    message = f"Your OTP for report access at Vicky Diagnostics is {otp}. This code is valid for 5 minutes."
    return send_brevo_sms(phone, message)

def send_booking_confirm_sms(phone: str, name: str, booking_id: str, service_name: str, date_str: str, time_str: str) -> bool:
    """Sends booking confirmation to patient."""
    message = (
        f"Dear {name}, your booking at Vicky Diagnostics is confirmed.\n"
        f"Booking ID: {booking_id}\n"
        f"Service: {service_name}\n"
        f"Date: {date_str}\n"
        f"Time: {time_str}"
    )
    return send_brevo_sms(phone, message)

def send_report_ready_sms(phone: str, name: str, report_id: str) -> bool:
    """Sends report approval and ready notification to patient."""
    message = f"Dear {name}, your diagnostic report (ID: {report_id}) is approved and ready. Please login to the reports portal to access/download it."
    return send_brevo_sms(phone, message)
