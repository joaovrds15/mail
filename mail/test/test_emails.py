import pytest
from unittest.mock import Mock, patch
from django.test import RequestFactory, Client
from django.test import TestCase

from mail.models import Email, User
from mail.views import mailbox

class YourTestCase(TestCase):
    @patch('mail.models.Email.objects.filter')
    def test_mail_mailbox_inbox(self, mock_get):
        user = User(username='email2', email='email2', password='senha2')

        mock_instance = Email.objects.none()
        mock_get.return_value = mock_instance

        request = RequestFactory().get('/emails/inbox')
        request.user = user
        mailbox(request, 'inbox')

        # Assertions and other test logic
        mock_get.assert_called_once_with(user=user, recipients=user, archived=False)  # Verify that the mocked method was called
        # Other assertions based on the behavior of your code

    @patch('mail.models.Email.objects.filter')
    def test_mail_mailbox_sent(self, mock_get):
        user = User(username='email2', email='email2', password='senha2')

        mock_instance = Email.objects.none() 
        mock_get.return_value = mock_instance

        request = RequestFactory().get('/emails/sent')
        request.user = user
        mailbox(request, 'sent')

        # Assertions and other test logic
        mock_get.assert_called_once_with(user=user, sender=user)  # Verify that the mocked method was called
        # Other assertions based on the behavior of your code
    
    @patch('mail.models.Email.objects.filter')
    def test_mail_mailbox_archive(self, mock_get):
        user = User(username='email2', email='email2', password='senha2')

        mock_instance = Email.objects.none() 
        mock_get.return_value = mock_instance

        request = RequestFactory().get('/emails/sent')
        request.user = user
        mailbox(request, 'archive')

        # Assertions and other test logic
        mock_get.assert_called_once_with(user=user, recipients=user, archived=True)  # Verify that the mocked method was called
        # Other assertions based on the behavior of your code