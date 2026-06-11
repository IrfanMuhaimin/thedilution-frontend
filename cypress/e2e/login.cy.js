/* eslint-disable no-undef */ 
// ^--- This line tells your React compiler to ignore Cypress globals safely!

describe('TheDilution System Access Security Control', () => {

  it('should successfully log in as Admin and land on Dashboard', () => {
    // 1. Visit the local Login URL
    cy.visit('http://localhost:3000/login');

    // 2. Assert that the page title header is visible
    cy.get('h1').should('contain', 'TheDilution System');

    // 3. Type credentials into input fields
    cy.get('input[placeholder="Enter your username"]').type('admin');
    cy.get('input[placeholder="Enter your password"]').type('password123');

    // 4. Click the Secure Sign In button
    cy.get('button').contains('Secure Sign In').click();

    // 5. Assert that the user successfully landed on the dashboard
    cy.url().should('eq', 'http://localhost:3000/');
    cy.get('h2').should('contain', 'Command Center'); 
  });

});