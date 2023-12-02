# BEGIN: abpxx6d04wxr

import pytest
import json
from unittest.mock import Mock, patch
from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser
from django.urls import reverse
from django.test import TestCase
from django.shortcuts import HttpResponse, HttpResponseRedirect

from mail.models import Email, User
from mail.views import mailbox, index, compose, login_view

@pytest.mark.django_db
def test_mail_mailbox_inbox():
    # Create a new user
    user = User.objects.create_user(username='email@example.com', password='password', email='email@example.com')
    user1 = User.objects.create_user(username='email1@example.com', password='password', email='email1@example.com')

    email = Email.objects.create(user=user1, sender=user, subject='subject', body='body', read=False)
    email.save()
    email.recipients.add(user1)

    request = RequestFactory().get('/emails/inbox')
    request.user = user1
    response = mailbox(request, 'inbox')
    json_data = json.loads(response.content)
    assert email.serialize() in json_data
    
@pytest.mark.django_db
def test_mail_mailbox_inbox_no_emails():
    # Create a new user
    user = User.objects.create_user(username='email@example.com', password='password', email='email@example.com')

    request = RequestFactory().get('/emails/inbox')
    request.user = user
    response = mailbox(request, 'inbox')
    json_data = json.loads(response.content)
    assert len(json_data) == 0

@pytest.mark.django_db
def test_mail_mailbox_inbox_unauthenticated():
    request = RequestFactory().get('/emails/inbox')
    request.user = None
    with pytest.raises(AttributeError) as e:
        response = mailbox(request, 'inbox')
        assert str(e.value) == "'NoneType' object has no attribute 'is_authenticated'"

@pytest.mark.django_db
def test_mail_mailbox_sent():
    # Create a new user
    user = User.objects.create_user(username='email@example.com', password='password', email='email@example.com')
    user1 = User.objects.create_user(username='email1@example.com', password='password', email='email1@example.com')

    email = Email.objects.create(user=user, sender=user, subject='subject', body='body', read=False)
    email.save()
    email.recipients.add(user1)

    request = RequestFactory().get('/emails/sent')
    request.user = user
    response = mailbox(request, 'sent')
    json_data = json.loads(response.content)
    assert email.serialize() in json_data

@pytest.mark.django_db
def test_mail_mailbox_invalid_mailbox():
    # Create a new user
    user = User.objects.create_user(username='email@example.com', password='password', email='email@example.com')

    request = RequestFactory().get('/emails/invalid')
    request.user = user
    response = mailbox(request, 'invalid')
    assert response.status_code == 400

@pytest.mark.django_db
def test_mail_index_authenticated():
    request = RequestFactory().get('/emails/inbox')
    request.user = AnonymousUser()
    response = index(request)
    # assert code 302
    assert response.status_code == 302
    assert isinstance(response, HttpResponseRedirect)
    expected_url = reverse("login")
    assert response.url == expected_url

@pytest.mark.django_db
def test_mail_index_unauthenticated():
    request = RequestFactory().get('/emails/inbox')
    request.user = AnonymousUser()
    response = index(request)
    # assert code 302
    assert response.status_code == 302
    assert isinstance(response, HttpResponseRedirect)
    expected_url = reverse("login")
    assert response.url == expected_url

@pytest.mark.django_db
def test_mail_index_authenticated():
    # Create an authenticated user
    user = User.objects.create_user(username='email@example.com', password='testpassword', email='email@example.com')
    
    # Create a request with the authenticated user
    request = RequestFactory().get('/emails/inbox')
    request.user = user
    
    response = index(request)
    assert response.status_code == 200

@pytest.mark.django_db
def test_mail_compose_with_invalid_http_method():
    request = RequestFactory().delete('/emails/compose')
    user = User.objects.create_user(username='testuser', password='testpassword')
    request.user = user
    response = compose(request)
    assert response.status_code == 400

@pytest.mark.django_db
def test_mail_compose_with_no_recipients():
    request = RequestFactory().post('/emails/compose')
    user = User.objects.create_user(username='email@example.com', password='testpassword', email='email@example.com')
    data = {'recipients': '', 'subject': 'Assunto', 'body': 'Corpo do email'}
    request = RequestFactory().post('/emails/compose', data=json.dumps(data), content_type='application/json')
    
    request.user = user
    response = compose(request)
    response_body = json.loads(response.content)

    assert response_body['error'] == 'At least one recipient required.'
    assert response.status_code == 400

@pytest.mark.django_db
def test_mail_compose_with_recipients_not_found():
    request = RequestFactory().post('/emails/compose')
    user = User.objects.create_user(username='email@example.com', password='testpassword', email='email@example.com')
    data = {'recipients': 'notfound@mail.com', 'subject': 'Assunto', 'body': 'Corpo do email'}
    request = RequestFactory().post('/emails/compose', data=json.dumps(data), content_type='application/json')
    
    request.user = user
    response = compose(request)
    response_body = json.loads(response.content)

    assert response_body['error'] == "User with email notfound@mail.com does not exist."
    assert response.status_code == 400

@pytest.mark.django_db
def test_mail_compose_ok():
    user = User.objects.create_user(username='email@example.com', password='testpassword', email='email@example.com')
    user = User.objects.create_user(username='email1@example.com', password='testpassword', email='email1@example.com')
    data = {'recipients': 'email1@example.com', 'subject': 'Assunto', 'body': 'Corpo do email'}
    request = RequestFactory().post('/emails/compose', data=json.dumps(data), content_type='application/json')
    
    request.user = user
    response = compose(request)
    response_body = json.loads(response.content)

    assert response_body['message'] == "Email sent successfully."
    assert response.status_code == 201

@pytest.mark.django_db
def test_mail_login_invalid_http_method():
    request = RequestFactory().delete('/login')
    response = login_view(request)
    assert isinstance(response, HttpResponse)

@pytest.mark.django_db
def test_mail_login_user_doesnt_exist():
    data = {
        'email': 'testmail@test.com',
        'password': 'testpassword'
    }

    request = RequestFactory().post('/login', data)
    response = login_view(request)
    assert isinstance(response, HttpResponse)
