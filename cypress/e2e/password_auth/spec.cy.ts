import { runTestServer } from '../../support/testUtils';

describe('Password Auth', () => {
  before(() => {
    runTestServer();
  });

  describe('when unauthenticated', () => {
    it('should redirect to login dialog', () => {
      cy.visit('/');
      cy.location('pathname').should('eq', '/login');
      cy.get("input[name='email']").should('exist');
      cy.get("input[name='password']").should('exist');
    });

    describe('visiting the /login', () => {
      beforeEach(() => {
        cy.visit('/login');
      })

      it('should fail to login with wrong credentials', () => {
        cy.get("input[name='email']").type('user');
        cy.get("input[name='password']").type('user');
        cy.get("button[type='submit']").click();
        cy.get('.MuiAlert-message').should('exist');
        cy.get('ol.toast');
      });

      it('should be able to login with correct credentials', () => {
        cy.get("input[name='email']").type('admin');
        cy.get("input[name='password']").type('admin');
        cy.get("button[type='submit']").click();
        cy.get('.step').eq(0).should('contain', 'Hello admin');

        cy.reload();
        cy.get("input[name='email']").should('not.exist');
        cy.get('.step').eq(0).should('contain', 'Hello admin');
      });

    })



  });

});
