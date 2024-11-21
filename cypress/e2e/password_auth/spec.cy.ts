import { runTestServer } from '../../support/testUtils';

describe('Password Auth', () => {
  before(() => {
    runTestServer();
  });

  describe('when unauthenticated', () => {
    describe('visiting /', () => {
      beforeEach(() => {
        cy.visit('/');
      });

      it('should redirect to login dialog', () => {
        cy.location('pathname').should('eq', '/login');
        cy.get("input[name='email']").should('exist');
        cy.get("input[name='password']").should('exist');
      });
    });

    describe('visiting /login', () => {
      beforeEach(() => {
        cy.visit('/login');
      });

      describe('submitting incorrect credentials', () => {
        it('should fail to login with wrong credentials', () => {
          cy.get("input[name='email']").type('user');
          cy.get("input[name='password']").type('user');
          cy.get("button[type='submit']").click();
          cy.get('.MuiAlert-message').should('exist');
          cy.get('ol.toast');
        });
      });

      describe('submitting correct credentials', () => {
        beforeEach(() => {
          cy.get("input[name='email']").type('admin');
          cy.get("input[name='password']").type('admin');

          cy.intercept('POST', '/login').as('login');
          cy.get("button[type='submit']").click();
        });

        const loggedIn = () => {
          cy.wait('@login').then((interception) => {
            // Response contains `Authorization` cookie, starting with Bearer
            expect(interception.response.headers).to.have.property(
              'set-cookie'
            );
            const cookie = interception.response.headers['set-cookie'][0];
            expect(cookie).to.contain('access_token');
          });

          cy.location('pathname').should('not.contain', '/login');
          cy.get("input[name='email']").should('not.exist');
          cy.get("input[name='password']").should('not.exist');

          cy.get('.step').eq(0).should('contain', 'Hello admin');
        };

        it('should be logged in', loggedIn);

        describe('after reloading', () => {
          beforeEach(() => {
            cy.reload();
          });
          it('should still be logged in', loggedIn);
        });
      });
    });
  });
});
