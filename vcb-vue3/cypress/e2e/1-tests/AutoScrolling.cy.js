/// <reference types="cypress" />
// https://docs.cypress.io/api/introduction/api.html
const bodyX = 100;
const bodyY = 300;

function searchInput() { return cy.findByPlaceholderText(/Search/i); }

describe('Auto scrolling', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5175/autoscrolling');
    cy.findByRole('button', { name: /reset/i }).click();
  });

  it('can read the initial value', () => {
    cy.findByPlaceholderText(/Search/i)
      .should('have.value', '');
  });

  it('can scroll past bottom', () => {
    searchInput().click().type('{downarrow}');
    cy.findByRole('option', { name: 'Gretsch' }).should('be.visible');
    searchInput().type('{downarrow}');
    cy.findByRole('option', { name: 'Ludwig' }).should('be.visible');
    searchInput().type('{downarrow}');
    cy.findByRole('option', { name: 'Mapex' }).should('be.visible');
    searchInput().type('{downarrow}');
    cy.findByRole('option', { name: 'Pearl' }).should('be.visible');
    searchInput().type('{downarrow}');
    cy.findByRole('option', { name: 'Sonor' }).should('be.visible');
    searchInput().type('{downarrow}');
    cy.findByRole('option', { name: 'Tama' }).should('be.visible');
    searchInput().type('{downarrow}');
    cy.findByRole('option', { name: 'Zildjian' }).should('be.visible');
    searchInput().type('{downarrow}');
    cy.findByRole('option', { name: 'Gretsch' }).should('be.visible');
  });

  it('can scroll past top', () => {
    searchInput().click().type('{downarrow}');
    searchInput().type('{uparrow}');
    cy.findByRole('option', { name: 'Zildjian' }).should('be.visible');
    searchInput().type('{uparrow}');
    cy.findByRole('option', { name: 'Tama' }).should('be.visible');
    searchInput().type('{uparrow}');
    cy.findByRole('option', { name: 'Sonor' }).should('be.visible');
    searchInput().type('{uparrow}');
    cy.findByRole('option', { name: 'Pearl' }).should('be.visible');
    searchInput().type('{uparrow}');
    cy.findByRole('option', { name: 'Mapex' }).should('be.visible');
    searchInput().type('{uparrow}');
    cy.findByRole('option', { name: 'Ludwig' }).should('be.visible');
    searchInput().type('{uparrow}');
    cy.findByRole('option', { name: 'Gretsch' }).should('be.visible');
    searchInput().type('{uparrow}');
    cy.findByRole('option', { name: 'Zildjian' }).should('be.visible');
  });
});
