import io
import base64
import qrcode
from qrcode.image.pil import PilImage


def generate_qr_code(token: str) -> str:
    """
    Generate a QR code PNG image from a token string.
    Returns the image as a base64-encoded string (without data URI prefix).
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(token)
    qr.make(fit=True)

    img: PilImage = qr.make_image(fill_color="#1E293B", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    b64_string = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return b64_string
