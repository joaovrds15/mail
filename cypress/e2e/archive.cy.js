import { login } from './common.cy';

describe('Teste arquivar email', () => {
  it('passes', () => {
    login();
    
    cy.get('tr.table-secondary').closest('tr').click();    
    cy.get('#archive-button').click();
    cy.url().should('include', '/inbox');
    cy.wait(2000);
    cy.get('#archived').click();
    cy.get('tr.table-secondary').closest('tr').click();
    cy.get('#archive-button').click();
  });
});