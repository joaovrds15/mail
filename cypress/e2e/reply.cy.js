describe('Teste responder email', () => {
    it('passes', () => {
        cy.visit('http://localhost:8000');
    
        cy.get('form[action="/login"]').within(() => {
          cy.get('input[name="email"]').type('testecypress@mail.com');
        });
        cy.get('input[name="password"]').type('senha123');
    
        cy.get('.btn-primary[type="submit"]').click();
    
        cy.get('tr.table-secondary').closest('tr').click();  

        cy.get('#reply-button').click();

        cy.get('#submit-email').click();

        cy.get('#emails-view h3').should('have.text', 'Sent');

      });
  });