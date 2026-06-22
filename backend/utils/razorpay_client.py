import hashlib
import hmac
import razorpay
from flask import current_app


def get_razorpay_client() -> razorpay.Client:
    """Return an authenticated Razorpay client using app config credentials."""
    key_id = current_app.config["RAZORPAY_KEY_ID"]
    key_secret = current_app.config["RAZORPAY_KEY_SECRET"]
    client = razorpay.Client(auth=(key_id, key_secret))
    return client


def create_order(amount_in_paise: int, currency: str = "INR", receipt: str = "") -> dict:
    """
    Create a Razorpay order.

    Args:
        amount_in_paise: Amount in the smallest currency unit (paise for INR).
        currency: ISO 4217 currency code, default 'INR'.
        receipt: Optional receipt ID for tracking (e.g., MongoDB order ID).

    Returns:
        dict: The Razorpay order object returned by the API.

    Raises:
        Exception: Propagates any Razorpay API errors.
    """
    client = get_razorpay_client()
    order_data = {
        "amount": amount_in_paise,
        "currency": currency,
        "receipt": receipt,
        "payment_capture": 1,  # Auto-capture payment
    }
    razorpay_order = client.order.create(data=order_data)
    return razorpay_order


def verify_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> bool:
    """
    Verify the HMAC-SHA256 signature returned by Razorpay after a payment.

    The expected signature is:
        HMAC_SHA256(razorpay_order_id + '|' + razorpay_payment_id, key_secret)

    Args:
        razorpay_order_id: The Razorpay order ID used during checkout.
        razorpay_payment_id: The payment ID returned by Razorpay on success.
        razorpay_signature: The signature string provided by the Razorpay webhook/callback.

    Returns:
        bool: True if the signature is valid, False otherwise.
    """
    try:
        key_secret = current_app.config["RAZORPAY_KEY_SECRET"]
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        expected_signature = hmac.HMAC(
            key_secret.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected_signature, razorpay_signature)
    except Exception:
        return False
