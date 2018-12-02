/********************************
-> CONTROLS BUDGET DATA
*********************************/
const budgetController = (() => {
  // Expense function constructor & methods
  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1; //When something is not defined use -1
  };

  // Prototype that caclculates percentage of expense
  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  // Prototype that get the percentage & returns it
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  // Expense function constructor & methods
  const Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculateTotal = function(type) {
    let sum = 0;
    // Add all items to get sum
    data.allItems[type].forEach(item => {
      sum += item.value;
    });
    // Push sum to appropriate total array
    data.totals[type] = sum;
  };

  // Stores all input data
  let data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  // Public methods - closure still has access to outter functions and variables
  return {
    // -> Allows UI to add item
    addItem: function(type, des, val) {
      let newItem, ID;

      // Create new Id
      // data type[last position of array] + 1
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new Item based on type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }
      // Push newly created item to the according arrays & return it
      data.allItems[type].push(newItem);
      return newItem;
    },

    // Deletes items
    deleteItem: function(type, id) {
      // .map() returns a brand new array
      // Creates a new array of ids
      const ids = data.allItems[type].map(item => {
        return item.id;
      });
      // Finds the index of the passed in id
      const index = ids.indexOf(id);
      // Delets the passed in id
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    // Controls all number methods & totals
    calculateBudget: function() {
      // Calculate total income and expenses
      calculateTotal('inc');
      calculateTotal('exp');

      // Calculate budget -> income -expenses
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percetage of income that has been spent
      // Avoids dividing a 0 by expense -> 0 / 900
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    // Calculates percentages
    calculatePercentages: function() {
      data.allItems.exp.forEach(item => {
        item.calcPercentage(data.totals.inc);
      });
    },

    // Gets calculated percentages
    getPercentages: function() {
      let allPerc = data.allItems.exp.map(item => {
        return item.getPercentage();
      });
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();

/********************************
-> CONTROLS UI
*********************************/
const uiController = (() => {
  const DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  // Formats numbers
  const formatNumbers = (num, type) => {
    num = Math.abs(num);
    // Keeps numbers always rounded to 2 decimal points
    num = num.toFixed(2);

    // Split number @ decimal and assign to 2 seperate variables
    let numSplit = num.split('.');
    let int = numSplit[0];

    // Adds commas / input- 23510 -> 23,510
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    let dec = numSplit[1];

    // Assigns inc or exp symbol + or -
    let sign;
    type === 'exp' ? (sign = '-') : (sign = '+');

    return `${sign} ${int}.${dec}`;
  };

  // Custom for each for nodelists
  const nodeListForEach = (list, callback) => {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  // Public methods - closure still has access to outter functions and variables
  return {
    // Makes DOMstrings available globaly
    getDOMstings: function() {
      return DOMstrings;
    },

    // Gets Expense input values
    getInput: function() {
      return {
        // Expence type -> will be either 'inc' or 'exp'
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    // Adds item to UI
    addListItem: function(obj, type) {
      let html, newHTML, element, value;

      value = formatNumbers(obj.value, type);
      // 1. Create HTML string with placeholder text

      if (type === 'inc') {
        // Select appropritate list too add to
        element = DOMstrings.incomeContainer;
        // INCOME
        html = `<div class="item clearfix" id="inc-${obj.id}">
        <div class="item__description">${obj.description}</div>
        <div class="right clearfix">
          <div class="item__value">${value}</div>
          <div class="item__delete">
            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
          </div>
        </div>
      </div>`;
      } else if (type === 'exp') {
        // Select appropritate list too add to
        element = DOMstrings.expensesContainer;
        // EXPENSE
        html = `<div class="item clearfix" id="exp-${obj.id}">
        <div class="item__description">${obj.description}</div>
        <div class="right clearfix">
          <div class="item__value">${value}</div>
          <div class="item__percentage">21%</div>
          <div class="item__delete">
            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
          </div>
        </div>
      </div>`;
      }
      // 3. Insert HTML into DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', html);
    },

    // Deletes item from list
    deleteListItem: function(selectorID) {
      // Get the passed in id element
      let el = document.getElementById(selectorID);
      // Select the parent node of the id then remove the element
      // In Js you have to select the parentNode of the element in order to remove the element
      el.parentNode.removeChild(el);
    },

    // CLears input fields
    clearFields: function() {
      const fields = document.querySelectorAll(
        DOMstrings.inputDescription + ', ' + DOMstrings.inputValue
      );
      // Change input values into array to use forEach
      let fieldsArray = [...fields];
      // Clears each input in the array
      fieldsArray.forEach(input => {
        input.value = '';
      });
      // Change focus to description input
      fieldsArray[0].focus();
    },

    // DISPLAYS BUDGET
    displayBudget: function(obj) {
      let type;
      obj.budget > 0 ? (type = 'inc') : 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget; // Budget
      document.querySelector(
        DOMstrings.incomeLabel
      ).textContent = formatNumbers(obj.totalInc, type); // Income
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumbers(obj.totalExp, type); // Expenses

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + '%'; // Perctage
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---'; // Protects against a negative percentage
      }
    },

    // DISPLAYS PERCENTAGES
    displayPercentages: function(percentages) {
      // Selects expense items
      const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, (current, index) => {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function() {
      let months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];
      let currentDate = new Date();
      let month = currentDate.getMonth();
      let year = currentDate.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + ' ' + year;
    },

    // Runs when exp or inc input type is changed
    changeType: function() {
      const fields = document.querySelectorAll(
        DOMstrings.inputType +
          ',' +
          DOMstrings.inputDescription +
          ',' +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, cur => {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    }
  };
})();

/********************************
-> CONTROLS  GLOBAL APP
*********************************/
const appController = ((budgetCtrl, UICtrl) => {
  //Sets up eventlisteners when called
  const setupEventlisteners = () => {
    /////// Callback / Helper functions ///////

    // Gets DOM strings in order to select each item
    const DOM = UICtrl.getDOMstings(); //Gets DOM Strings

    // Event listener for add button
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    // Eventlistener for keypress on global scope -> for enter of expense
    document.addEventListener('keypress', e => {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    // Eventlistener which selects the parent container for income and expenses
    // and deletes the clicked item
    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);

    // Listens for change of income or expense from selector input
    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changeType);
  };

  // Update Budget
  const updateBudget = () => {
    // Caculate the budget
    budgetCtrl.calculateBudget();
    // Method to return the budget
    let budget = budgetCtrl.getBudget();
    console.log('budget', budget);
    // Display budget on UI
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = () => {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();
    // 2. Read % from budget ctrl
    let percentages = budgetCtrl.getPercentages();
    console.log('percentages', percentages);
    // 3. Update UI with new %
    UICtrl.displayPercentages(percentages);
  };

  // Adds Item
  const ctrlAddItem = () => {
    // 1. Get expense input values
    const input = UICtrl.getInput();
    console.log('input', input);
    // Validate form data
    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. Add item from budget controller
      const newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      );
      // 3. Add item to UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear input fields
      UICtrl.clearFields();
      // 5. Caculate and update the budget
      updateBudget();
      // 6. Calculate and update Percentages
      updatePercentages();
    } else {
      alert('Please validate input values');
    }
  };

  // Controls deleting of items
  const ctrlDeleteItem = e => {
    // Gets the id of clicked item Income & Expense
    let itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      let splitId = itemID.split('-');
      let type = splitId[0];
      let ID = parseInt(splitId[1]);
      // 1.Delete item form Data structure
      budgetCtrl.deleteItem(type, ID);
      // 2.Delete item from UI
      UICtrl.deleteListItem(itemID);
      // 3.Update Budget / totals
      updateBudget();
      // 4. Calculate and update percentages
      updatePercentages();
    }
  };

  // Public methods - closure still has access to outter functions and variables
  return {
    // Function that initializes app
    init: function() {
      console.log('App Started...');
      // Gets current month and year
      UICtrl.displayMonth();
      // Gets total budget, expenses, and income
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      // Initializes Event listeners
      setupEventlisteners();
    }
  };
})(budgetController, uiController);

// Start App
appController.init();
