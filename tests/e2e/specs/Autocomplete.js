// https://docs.cypress.io/api/introduction/api.html
const bodyX = 100;
const bodyY = 300;

describe('My First Test', () => {
  before(() => {
    cy.visit('/');
    // can read the initial value
    cy.findByTestId('combobox-input')
      .should('have.value', 'first');
  });
  beforeEach(() => {
    cy.findByTestId('clear-button').click();
  });

  it('can read the initial value', () => {
    cy.findByTestId('combobox-input')
      .should('have.value', '');
  });
  it('can select an item', () => {
    cy.findByTestId('combobox-input')
      .type('sec{downarrow}{enter}')
      .should('have.value', 'second');
  });
  it('can arrow up to select last item', () => {
    cy.findByTestId('combobox-input')
      .type('{downarrow}{uparrow}{enter}') // open menu, last option is focused
      .should('have.value', 'duplicate');
  });
  it('can arrow down to select first item', () => {
    cy.findByTestId('combobox-input')
      .type('{downarrow}{enter}') // open menu, first option is focused
      .should('have.value', 'first');
  });
  it('can down arrow to select an item', () => {
    cy.findByTestId('combobox-input')
      .type('{downarrow}{downarrow}{enter}') // open and select second item
      .should('have.value', 'second');
  });
  it('resets the item on blur', () => {
    cy.findByTestId('combobox-input')
      .type('{downarrow}{enter}') // open and select first item
      .should('have.value', 'first')
      .type('eee') // type some rubbish
      .get('body')
      .click(bodyX, bodyY)
      .findByTestId('combobox-input')
      .should('have.value', 'first');
  });
  it('can use the mouse to click an item', () => {
    cy.findByTestId('combobox-input').type('second');
    cy.findByTestId('vue-combo-blocks-item-0').click();
    cy.findByTestId('combobox-input').should('have.value', 'second');
  });
  it('keeps the list open when focus is inside the list', () => {
    cy.findByTestId('combobox-input').type('asdfasdf');
    cy.findByTestId('no-results').click().click();
    cy.findByTestId('combobox-input').should('have.value', 'asdfasdf');
    cy.get('body')
      .click(bodyX, bodyY);
    cy.findByTestId('combobox-input').should('have.value', '');
  });
  it('does not reset the input when mouseup outside while the input is focused', () => {
    cy.findByTestId('combobox-input').type('first');
    cy.findByTestId('vue-combo-blocks-item-0').click();
    cy.findByTestId('combobox-input')
      .should('have.value', 'first')
      .type('{backspace}{backspace}')
      .should('have.value', 'fir')
      .click()
      .get('body')
      .trigger('mouseup', bodyX, bodyY)
      .findByTestId('combobox-input')
      .should('have.value', 'fir')
      .blur()
      .get('body')
      .trigger('click', bodyX, bodyY)
      .findByTestId('combobox-input')
      .should('have.value', 'first');
  });
  it('resets when bluring the input', () => {
    cy.findByTestId('combobox-input')
      .type('fir')
      .blur()
      // https://github.com/kentcdodds/cypress-testing-library/issues/13
      .wait(1)
      .should('have.value', '')
      .findByTestId('vue-combo-blocks-item-0', { timeout: 10 })
      .should('not.be.visible');
  });
  it('shows selected item styles', () => {
    cy.findByTestId('combobox-input')
      .type('sec');
    cy.findByTestId('vue-combo-blocks-item-0').click();
    cy.findByTestId('combobox-input').clear()
      .type('{downarrow}');
    cy.findByTestId('vue-combo-blocks-item-0').should('not.have.class', 'selected');
    cy.findByTestId('vue-combo-blocks-item-1').should('have.class', 'selected');
    cy.findByTestId('vue-combo-blocks-item-2').should('not.have.class', 'selected');
  });
  // TODO: tabbing is not currently supported in cypress
  // it('autocompletes the hovered when tabbed', () => {
  //   cy.findByTestId('combobox-input')
  //     .type('sec{downarrow}').tab();
  //   cy.findByTestId('combobox-input')
  //     .should('have.value', 'first');
  // });
  it('shows hovered item styles', () => {
    cy.findByTestId('combobox-input')
      .type('{downarrow}{downarrow}');
    cy.findByTestId('vue-combo-blocks-item-0').should('not.have.class', 'hovered');
    cy.findByTestId('vue-combo-blocks-item-1').should('have.class', 'hovered');
    cy.findByTestId('vue-combo-blocks-item-2').should('not.have.class', 'hovered');
  });
  it('does not reset when swiping outside to scroll a touch screen', () => {
    cy.findByTestId('combobox-input')
      .type('fir')
      .get('body')
      .trigger('touchstart', bodyX, bodyY)
      .trigger('touchmove', bodyX, bodyY + 20)
      .trigger('touchend', bodyX, bodyY + 20);
    cy.findByTestId('vue-combo-blocks-item-0', { timeout: 10 }).should('be.visible');
  });

  // TODO: Touch event support
  // it('resets when tapping outside on a touch screen', () => {
  //   cy.findByTestId('combobox-input')
  //     .type('thir')
  //     .get('body')
  //     .trigger('touchstart', bodyX, bodyY)
  //     .trigger('touchend', bodyX, bodyY);
  //   cy.findByTestId('vue-combo-blocks-item-0', { timeout: 100 }).should('not.be.visible');
  // });

  // TODO: Implement toggle buttons
  // it('does not reset when tabbing from input to the toggle button', () => {
  //   cy.findByTestId('combobox-input').type('th')
  //   cy.findByTestId('toggle-button').focus()
  //   cy.findByTestId('downshift-item-0').click()
  //   cy.findByTestId('combobox-input').should('have.value', 'third')
  // })
  // it('does not reset when tabbing from the toggle button to the input', () => {
  //   cy.findByTestId('toggle-button').click()
  //   cy.findByTestId('combobox-input').focus()
  //   cy.findByTestId('downshift-item-0').click()
  //   cy.findByTestId('combobox-input').should('have.value', 'first')
  // })

  // TODO: support for home and end keys
  // it('can use home key to select first item', () => {
  //   cy.findByTestId('combobox-input')
  //     .type('{downarrow}{downarrow}{home}{enter}') // open to first, go down to second, return to first by home.
  //     .should('have.value', 'first');
  // });
  // it('can use end key to select last item', () => {
  //   cy.findByTestId('combobox-input')
  //     .type('{downarrow}{end}{enter}') // open to first, go to last by end.
  //     .should('have.value', 'duplicate');
  // });
});
