// https://docs.cypress.io/api/introduction/api.html
const bodyX = 100;
const bodyY = 300;

describe('MultiSelect', () => {
  before(() => {
    cy.visit('/multiselect');
    // can read the initial value
    cy.findByTestId('multiselect-input')
      .should('have.value', '');
  });
  beforeEach(() => {
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
