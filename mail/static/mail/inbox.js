//Corrigir email single view

document.addEventListener('DOMContentLoaded', function () {
  window.onpopstate = function (event) {

    if (event.state.section == 'compose') {
      return compose_email();
    }

    load_mailbox(event.state.section);
  }

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.getElementById("reply-button").addEventListener("click", reply_email);
  document.getElementById('archive-button').addEventListener("click", archive_email);
  document.getElementById("compose-form").addEventListener("submit", function (event) {
    event.preventDefault();

    send_email()
      .then(response => {
        load_mailbox('sent');
      })
      .catch(error => {
        console.error('Error sending email:', error);
      });
  });

  document.querySelectorAll('.nav-buttons').forEach(button => {
    button.onclick = function () {
      const section = this.textContent.toLowerCase();

      history.pushState({ section: section }, "", `${section}`);
      load_mailbox(section);
    };
  });

  // // By default, load the inbox
  history.pushState({ section: 'inbox' }, "", "inbox");
  load_mailbox('inbox');
});

function compose_email() {

  history.pushState({ section: 'compose' }, "", 'compose');
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  load_emails(mailbox);
}

function load_emails(mailbox) {

  document.querySelectorAll('.nav-buttons').forEach(button => {
    button.style.backgroundColor = '#e7e7e7';
  });

  let buttonStyle = mailbox === 'archive' ? "archived" : mailbox;
  document.querySelector('#' + buttonStyle).style.backgroundColor = 'rgba(211, 227, 253, 1)';

  mailbox = mailbox === 'archived' ? 'archive' : mailbox;

  const table = document.createElement('table');
  table.setAttribute('class', 'table table-hover table-sm');

  const tbody = document.createElement('tbody');
  tbody.setAttribute('id', 'emails-table-body');

  table.appendChild(tbody);
  const emailsView = document.getElementById('emails-view');
  emailsView.appendChild(table);

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => emails.map(email => {

      if (!email.archived || mailbox == 'archive') {
        add_email_to_table(email, tbody);
      }

    }))

}

function load_email(divElement) {
  const hiddenInput = divElement.querySelector('input[type="hidden"]');
  const id = hiddenInput.value;

  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      load_email_view(email);
    })
    .catch(error => {
      console.error('Fetch Error:', error);
    });
}

function reply_email() {

  let emailSender = document.getElementById('email-sender').textContent;
  let emailSubject = document.getElementById('email-subject').textContent;
  let emailTimestamp = document.getElementById('email-timestamp').textContent;
  let emailBody = document.getElementById('email-body').textContent;
  let finalBody = "On " + emailTimestamp + " " + emailSender + " wrote: " + emailBody;

  document.querySelector('#compose-recipients').value = emailSender;
  document.querySelector('#compose-subject').value = emailSubject.startsWith('Re: ') ? emailSubject : 'Re: ' + emailSubject;
  document.querySelector('#compose-body').value = finalBody;

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

}

function load_email_view(email) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  const userEmail = document.getElementById('user-email').textContent;

  if (email.sender == userEmail) {
    document.getElementById('archive-button').style.display = 'none';
  } else {
    document.getElementById('archive-button').style.display = 'inline-block';
  }

  if (email.archived) {
    document.getElementById('archive-text').textContent = 'Unarchive';
  } else {
    document.getElementById('archive-text').textContent = 'Archive';
  }

  let emailSubject = document.getElementById('email-subject');
  let emailSender = document.getElementById('email-sender');
  let emailRecipients = document.getElementById('email-recipients');
  let emailBody = document.getElementById('email-body');
  let emailTimestamp = document.getElementById('email-timestamp');
  let emailId = document.getElementById('email-id');

  if (!email.read) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
  }

  emailSubject.textContent = email.subject;
  emailSender.textContent = email.sender;
  emailRecipients.textContent = email.recipients;
  emailBody.textContent = email.body;
  emailTimestamp.textContent = email.timestamp;
  emailId.value = email.id;
}

async function send_email() {
  const recipients = document.getElementById('compose-recipients').value.replace(/\s+/g, '');
  const subject = document.getElementById('compose-subject').value;
  const body = document.getElementById('compose-body').value;

  return fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json());
}

function archive_email() {
  const emailId = document.getElementById('email-id').value;

  fetch(`/emails/${emailId}`)
    .then(response => response.json())
    .then(email => {
      let flagArchive = !email.archived;

      return fetch(`/emails/${emailId}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: flagArchive
        })
      });
    })
    .then(response => {
      if (response.ok) {
        load_mailbox('inbox');
      } else {
        console.error('Error archiving email:', response);
      }
    })
    .catch(error => {
      console.error('Fetch Error:', error);
    });
}

function add_email_to_table(email, tableBody) {
  const input = document.createElement('input');

  input.type = 'hidden';
  input.value = email.id;
  
  const newRow = document.createElement('tr');
  newRow.setAttribute('onClick', 'load_email(this)')
  newRow.appendChild(input);

  if (email.read) {
    newRow.setAttribute('class', 'table-secondary');
  }

  const senderCell = document.createElement('td');
  const subjectCell = document.createElement('td');
  const timestampCell = document.createElement('td');

  newRow.appendChild(senderCell);
  newRow.appendChild(subjectCell);
  newRow.appendChild(timestampCell);

  senderCell.textContent = email.sender;
  subjectCell.textContent = email.subject;
  timestampCell.textContent = email.timestamp;

  tableBody.appendChild(newRow);
}
