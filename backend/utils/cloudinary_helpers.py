import cloudinary
import cloudinary.uploader
import cloudinary.api
from config import config

# Configure Cloudinary globally
cloudinary.config(
    cloud_name=config.CLOUDINARY_CLOUD_NAME,
    api_key=config.CLOUDINARY_API_KEY,
    api_secret=config.CLOUDINARY_API_SECRET,
    secure=True
)

def upload_image(file_data, folder="smart_canteen/products"):
    """
    Uploads a base64 image or a file to Cloudinary.
    Returns the secure URL and the public_id.
    """
    if not config.CLOUDINARY_CLOUD_NAME:
        # Fallback if Cloudinary is not configured
        return {"url": file_data, "public_id": None}

    try:
        response = cloudinary.uploader.upload(
            file_data,
            folder=folder,
            resource_type="image"
        )
        return {
            "url": response.get("secure_url"),
            "public_id": response.get("public_id")
        }
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        raise ValueError(f"Failed to upload image: {e}")

def delete_image(public_id):
    """
    Deletes an image from Cloudinary using its public_id.
    """
    if not public_id or not config.CLOUDINARY_CLOUD_NAME:
        return False
        
    try:
        response = cloudinary.uploader.destroy(public_id)
        return response.get("result") == "ok"
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
        return False

def extract_public_id(url):
    """
    Extracts the public_id from a Cloudinary URL to delete it later.
    URL format: https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/folder/filename.jpg
    """
    if not url or "res.cloudinary.com" not in url:
        return None
        
    try:
        # Get everything after /upload/ (including version if present, but we don't need version for deletion)
        parts = url.split("/upload/")
        if len(parts) < 2:
            return None
            
        path = parts[1]
        # Remove version (v1234567890/) if it exists
        if path.startswith("v") and "/" in path:
            version_part = path.split("/")[0]
            if version_part[1:].isdigit():
                path = path[len(version_part) + 1:]
                
        # Remove file extension
        public_id = path.rsplit(".", 1)[0]
        return public_id
    except Exception:
        return None
