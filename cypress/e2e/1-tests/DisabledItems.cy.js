/// <reference types="cypress" />
// https://docs.cypress.io/api/introduction/api.html
const bodyX = 100;
const bodyY = 300;

describe('DisabledItems', () => {
  before(() => {
    cy.visit('http://127.0.0.1:5173/disableditems');
    // can read the initial value
    cy.findByPlaceholderText(/Search/i)
      .should('have.value', '');
  });
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5173/disableditems');
    cy.findByRole('button', { name: /reset/i }).click();
  });

  it('can read the initial value', () => {
    cy.findByPlaceholderText(/Search/i)
      .should('have.value', '');
  });

  it('can see disabled item, cant select', () => {
    cy.findByPlaceholderText(/Search/i)
      .type('{downarrow}');

    cy.findByRole('option', { name: /Tama/i }).should('not.have.attr', 'disabled');

    cy.findByRole('option', { name: /Zildjian/i }).should('have.attr', 'disabled');
    cy.findByRole('option', { name: /Zildjian/i }).click();
    cy.findByRole('option', { name: /Zildjian/i }).should('have.attr', 'aria-selected', 'false');
    cy.findByRole('option', { name: /Zildjian/i }).should('be.visible');
  });
});
