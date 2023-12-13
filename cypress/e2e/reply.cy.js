import { login } from './common.cy';

describe('Teste responder email', () => {
  it('passes', () => {
    login();
    
    cy.get('tr.table-secondary').closest('tr').click();  
    cy.get('#reply-button').click();
    cy.get('#submit-email').click();
    cy.get('#emails-view h3').should('have.text', 'Sent');
  });
});