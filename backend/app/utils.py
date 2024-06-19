import logging
import requests
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import emails  # type: ignore
from jinja2 import Template
from jose import JWTError, jwt

from app.core.config import settings
from b2sdk.v2 import InMemoryAccountInfo, B2Api
from bs4 import BeautifulSoup
import requests

@dataclass
class EmailData:
    html_content: str
    subject: str


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
        Path(__file__).parent / "email-templates" / "build" / template_name
    ).read_text()
    html_content = Template(template_str).render(context)
    return html_content


def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
) -> None:
    assert settings.emails_enabled, "no provided configuration for email variables"
    message = emails.Message(
        subject=subject,
        html=html_content,
        mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
    )
    smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}
    if settings.SMTP_TLS:
        smtp_options["tls"] = True
    elif settings.SMTP_SSL:
        smtp_options["ssl"] = True
    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD
    response = message.send(to=email_to, smtp=smtp_options)
    logging.info(f"send email result: {response}")


def generate_test_email(email_to: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Test email"
    html_content = render_email_template(
        template_name="test_email.html",
        context={"project_name": settings.PROJECT_NAME, "email": email_to},
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_reset_password_email(email_to: str, email: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Password recovery for user {email}"
    link = f"{settings.server_host}/reset-password?token={token}"
    html_content = render_email_template(
        template_name="reset_password.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": email,
            "email": email_to,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_new_account_email(
    email_to: str, username: str, password: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New account for user {username}"
    html_content = render_email_template(
        template_name="new_account.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "password": password,
            "email": email_to,
            "link": settings.server_host,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_password_reset_token(email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.utcnow()
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return str(decoded_token["sub"])
    except JWTError:
        return None

info = InMemoryAccountInfo()
b2_api = B2Api(info)
b2_api.authorize_account("production", settings.B2_APPLICATION_KEY_ID, settings.B2_APPLICATION_KEY)
bucket = b2_api.get_bucket_by_name(settings.B2_BUCKET_NAME)

def upload_file_to_b2(file, file_name):
    file_info = bucket.upload_bytes(file.read(), file_name)
    print(f"File Info: {file_info}")

    file_url = f"https://f002.backblazeb2.com/file/{settings.B2_BUCKET_NAME}/recipes/{file_name}"
    return file_url

def delete_file_from_b2(file_path: str):
    file_name = file_path.split('/')[-1]
    file_versions = bucket.list_file_versions(file_name)

    for file_version in file_versions:
        bucket.delete_file_version(file_version.id_, file_version.file_name)


def get_download_authorization(valid_duration_in_seconds: int = 3600):
    """
    Generates a download authorization token for a specific file in a Backblaze B2 private bucket.
    """
    # Authenticate with B2
    auth_response = requests.get(
        'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
        auth=(settings.B2_APPLICATION_KEY_ID, settings.B2_APPLICATION_KEY)
    )
    auth_data = auth_response.json()
    
    api_url = auth_data['apiUrl']
    authorization_token = auth_data['authorizationToken']

    # Get download authorization
    download_auth_response = requests.post(
        f'{api_url}/b2api/v2/b2_get_download_authorization',
        headers={'Authorization': authorization_token},
        json={
            'bucketId': settings.B2_BUCKET_ID,
            'fileNamePrefix': "recipes/",
            'validDurationInSeconds': valid_duration_in_seconds
        }
    )
    download_auth_data = download_auth_response.json()
    print(f"Download Auth Data: {download_auth_data}")
    
    if 'authorizationToken' not in download_auth_data:
        raise Exception('Failed to get download authorization', download_auth_data)

    return download_auth_data['authorizationToken']

async def fetch_html_content(url: str) -> str:
  response = requests.get(url)
  if response.status_code == 200:
    return response.text
  else:
    raise Exception(f"Failed to fetch HTML content from {url}")

        
def parse_open_graph_data(html: str) -> dict:
    soup = BeautifulSoup(html, 'html.parser')
    meta_tags = soup.find_all('meta')

    metadata = {}

    for tag in meta_tags:
        if 'name' in tag.attrs:
            name = tag.attrs['name']
            content = tag.attrs.get('content', '')
            metadata[name] = content
        elif 'property' in tag.attrs:
            property = tag.attrs['property']
            content = tag.attrs.get('content', '')
            metadata[property] = content
    
    return metadata
