describe('Teste arquivar email', () => {
    it('passes', () => {
        cy.visit('http://localhost:8000');
    
        cy.get('form[action="/login"]').within(() => {
          cy.get('input[name="email"]').type('testecypress@mail.com');
        });
        cy.get('input[name="password"]').type('senha123');
    
        cy.get('.btn-primary[type="submit"]').click();
    
        cy.get('tr.table-secondary').closest('tr').click();    

        cy.get('#archive-button').click();

        cy.url().should('include', '/inbox');

        cy.wait(2000);

        cy.get('#archived').click();

        cy.get('tr.table-secondary').closest('tr').click();

        cy.get('#archive-button').click();
      });
  });
  