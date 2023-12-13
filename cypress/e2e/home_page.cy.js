describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:8000');

    cy.get('form[action="/login"]').within(() => {
      cy.get('input[name="email"]').type('teste@selenium.com');
    });
    cy.get('input[name="password"]').type('senha123');

    cy.get('.btn-primary[type="submit"]').click();

    cy.url().should('include', '/inbox');
  });
});
