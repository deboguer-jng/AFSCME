import { LitElement, html } from 'lit';
import { v4 as uuidv4 } from 'uuid';
import { RegistrationFormStyles } from './RegistrationForm.styles';

class RegistrationForm extends LitElement {
  static styles = RegistrationFormStyles;

  firstName = '';
  lastName = '';
  state = '';
  affiliation = '';
  email = '';
  affiliations = {};
  static get properties() {
    return {
      users: { type: Array },
      isUserSelected: { type: Number },
      states: { type: Array },
      emailError: { type: String }
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.fetchUsers();
  }

  /**
   * This will fetch all the Users from the database to populate the dropdown on page load.
   * @returns {Promise<void>}
   */
  async fetchUsers() {
    let response = await fetch('https://83k4jems55.execute-api.us-east-1.amazonaws.com/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    let items = await response.text();
    items = JSON.parse(items);
    this.users = items.data;
  }

  async handleSubmit(e) {
    const validEmail = this.validateEmail(this.email);
    if (!validEmail) {
      this.emailError = 'Invalid email format';
      e.preventDefault();
    } else {
      this.emailError = '';
      if (e) {
        e.preventDefault();
      }
      // Save data to Dynamo table
      this.saveData(e);
    }
  }


  resetForm() {
    const form = this.shadowRoot.querySelector('form');
    console.log("form", form);
    if (form) {
      form.reset();
      this.firstName = '';
      this.lastName = '';
      this.state = '';
      this.affiliation = '';
      this.email = '';
    }
  }

  validateEmail(email) {
    // Validate email using a simple regex for domain format
    const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;
    return emailRegex.test(email);
  }

  /**
  * Logic to save data to Dynamo Database.
  * @returns {Promise<void>}
  */
  async saveData(e) {

    const registrationData = {
      id: uuidv4(),
      firstname: this.firstName,
      lastname: this.lastName,
      state: this.state,
      affiliation: this.affiliation,
      email: this.email,
      role: 'User',
      status: 'Pending'
    };

    const response = await fetch('https://83k4jems55.execute-api.us-east-1.amazonaws.com/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });

    if (response.ok) {
      this.showSuccessMessage();
      this.resetForm();
      if (e) {
        e.preventDefault = null;
      }
      this.updateAffiliationOptions();
    } else {
      throw new Error('Registration failed. Please try again later.');
    }
  }

  showSuccessMessage() {
    alert('Your Account has been submitted to AFSCME for review.');
  }


  /**
   * This will fetch all the affiliation from the database to populate the dropdown after state selection.
   * @returns {Promise<void>}
   */
  onStateChange(e) {
    this.state = e.target.value;
    this.affiliation = '';
    console.log(this.state);
    this.updateAffiliationOptions();
  }

  /**
   * This will fetch all the state from the database to populate the dropdown after user selection.
   * @returns {Promise<void>}
   */
  async onUsersChange(e) {
    let user = e.target.value;
    if (user) {
      this.isUserSelected = 1;
      let response = await fetch('https://83k4jems55.execute-api.us-east-1.amazonaws.com/states', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      let items = await response.text();
      items = JSON.parse(items);
      this.states = items.data;
    } else
      this.isUserSelected = 0;
  }

  getSelectValues(select) {
    var result = [];
    var options = select && select.options;
    var opt;

    for (var i = 0, iLen = options.length; i < iLen; i++) {
      opt = options[i];

      if (opt.selected) {
        result.push(opt.value || opt.text);
      }
    }
    return result;
  }
  
  onAffiliationChange(e) {
    this.affiliation = this.getSelectValues(e.target).join();
    this.updateAffiliationOptions();
  }

  async updateAffiliationOptions() {
    if (!this.state) {
      this.affiliations = [];
      this.requestUpdate();
      return;
    }

    let response = await fetch('https://83k4jems55.execute-api.us-east-1.amazonaws.com/affiliations?state=' + this.state, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    let items = await response.text();
    items = JSON.parse(items);
    this.affiliations = items.data.map(item => item.affiliate_name);

    // Trigger a re-render to update the affiliation dropdown based on the selected state
    this.requestUpdate();
  }

  render() {
    return html`
      ${!this.isUserSelected ?
        html`
        <div class="container" id="form">
        <div class="input-group">
          <label for="users">User</label>
          <select
            id="users"
            @change=${this.onUsersChange}
            required
          >
            <option value="" selected disabled>Select User</option>
            ${this.users?.map(
          (user) => html`<option value=${user.id}>${user.firstname + " " + user.lastname}</option>`
        )}
          </select>
          </div>
        </div>`:
        html`
      <div class="container">        
        <form id="form" @reset=${this.resetForm} @submit=${this.handleSubmit}>
        <h1>Registration Form</h1>
        <div class="input-group">  
        <label for="firstName">First Name:</label>
          <input
            id="firstName"
            type="text"
            .value=${this.firstName}
            @input=${(e) => {
            this.firstName = e.target.value;
          }}
            required
          />
          </div>

          <div class="input-group">
          <label for="lastName">Last Name:</label>
          <input
            id="lastName"
            type="text"
            .value=${this.lastName}
            @input=${(e) => {
            this.lastName = e.target.value;
          }}
            required
          />
          </div>    

          <div class="input-group"> 
          <label for="state">State:</label>
          <select
            id="state"
            @change=${this.onStateChange}
            required
          >
            <option value="" selected disabled>Select State</option>
            ${this.states ? this.states.map(
            (state) => html`<option value=${state}>${state}</option>`
          ) : ''}
          </select>
          </div>
       
          <div class="input-group"> 
          <label for="affiliation">Affiliation:</label>
          <select
            id="affiliation" .disabled=${!this.state}
            @change=${this.onAffiliationChange}
            required
            multiple
          >
            <option value="" selected disabled>Select Affiliation</option>
            ${this.state ? this.affiliations?.map(
            (affiliation) => html`<option value=${affiliation}>${affiliation}</option>`
          ) : ''}
          </select>
         </div>     
          
         <div class="input-group"> 
          <label for="email">Email:</label>
          <input
            id="email"
            type="email"
            .value=${this.email}
            @input=${(e) => {
            this.email = e.target.value;
            this.emailError = ''; // Clear error when typing
          }}
            required
          />
          <div class="error">${this.emailError}</div>
          </div>

          <!-- Buttons container -->
          <div class="button-container">
            <!-- Register button -->
            <button id="registerButton"  type="submit">Register</button>
      
            <!-- Cancel button -->
            <!-- <button type="reset">Cancel</button> -->
          </div>
        </form>
      </div>     
    `}`
  }
}

customElements.define('registration-form', RegistrationForm);