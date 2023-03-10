/// <reference types="cypress" />
// https://docs.cypress.io/api/introduction/api.html
const bodyX = 100;
const bodyY = 300;

describe('Control Props', () => {
  before(() => {
    cy.visit('http://127.0.0.1:5173/controlledprop');
    // can read the initial value
    cy.findByPlaceholderText(/Search/i)
      .should('have.value', '');
  });
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5173/controlledprop');
    cy.findByRole('button', { name: /clear/i }).click();
  });

  it('can read the initial value', () => {
    cy.findByPlaceholderText(/Search/i)
      .should('have.value', '');

    cy.findByRole('heading', { name: /Nothing/i });
  });

  it('can select next item by clicking button', () => {
    cy.findByRole('button', { name: /select next/i }).click();
    cy.findByRole('heading', { name: /first/i });
    cy.findByRole('button', { name: /select next/i }).click();
    cy.findByRole('heading', { name: /second/i });
    cy.findByRole('button', { name: /select next/i }).click();
    cy.findByRole('heading', { name: /third/i });
    cy.findByRole('button', { name: /select next/i }).click();
    cy.findByRole('heading', { name: /duplicate/i });
    cy.findByRole('button', { name: /select next/i }).click();
    cy.findByRole('heading', { name: /duplicate/i });

    cy.findByRole('button', { name: /select next/i }).click();
    cy.findByRole('heading', { name: /first/i });
  });

  it('can select next item normally', () => {
    cy.findByRole('button', { name: /select next/i }).click();
    cy.findByPlaceholderText(/Search/i).clear().type('sec{downarrow}{enter}');
    cy.findByRole('heading', { name: /second/i });
  });
});
