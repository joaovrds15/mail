describe('Teste de Registro de Usuário', () => {
    it('Deve preencher os campos e clicar no botão de registro', () => {
      // Visitar a página de registro (certifique-se de substituir pela URL correta)
      cy.visit('http://localhost:8000/register');
  
      // Gerar um e-mail aleatório
      const randomEmail = `testuser${Math.floor(Math.random() * 100000)}@example.com`;
  
      // Preencher o campo de e-mail com o e-mail aleatório gerado
      cy.get('input[name="email"]').type(randomEmail);
  
      // Preencher o campo de senha com uma senha fixa (ou outro método de sua escolha)
      const fixedPassword = 'senhaFixa123';  // Substitua pela senha desejada
      cy.get('input[name="password"]').type(fixedPassword);
  
      // Preencher o campo de confirmação de senha com a mesma senha fixa
      cy.get('input[name="confirmation"]').type(fixedPassword);
  
      // Adicionar mais campos ou dados conforme necessário
  
      // Clicar no botão de registro
      cy.get('input[value="Register"]').click();
  
      cy.url().should('include', '/inbox');
    });
  });
  