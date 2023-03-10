/// <reference types="cypress" />
// https://docs.cypress.io/api/introduction/api.html

describe('MultiSelect', () => {
  before(() => {
    cy.visit('http://127.0.0.1:5175/multiselect');
    // can read the initial value
    cy.findByTestId('multiselect-input')
      .should('have.value', '');
  });
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5175/multiselect');
    cy.findByTestId('clear-button').click();
  });

  it('can read the initial value', () => {
    cy.findByTestId('multiselect-input')
      .should('have.value', '');
  });

  it('can select multiple items', () => {
    cy.findByTestId('multiselect-input')
      .type('{downarrow}{enter}')
      .type('{downarrow}{enter}');

    cy.findByTestId('vue-combo-blocks-item-0').should('have.class', 'selected');
    cy.findByTestId('vue-combo-blocks-item-1').should('have.class', 'selected');
  });

  it('can keep the input element value when no selectable item', () => {
    cy.findByTestId('multiselect-input')
      .type('sec{downarrow}{enter}')
      .should('have.value', 'sec');
  });
});
