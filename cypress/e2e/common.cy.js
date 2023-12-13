export function login() {
    cy.visit('http://localhost:8000');
    
    cy.get('form[action="/login"]').within(() => {
      cy.get('input[name="email"]').type('testecypress@mail.com');
    });
    cy.get('input[name="password"]').type('senha123');
    
    cy.get('.btn-primary[type="submit"]').click();
}