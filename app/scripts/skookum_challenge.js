"use strict";

/*****
  Summary:
  Organizes our data into an object that we can easily print

  Params:
  json -- a JSON list returned by the API that must contain the following keys:
  "brokerageName",
  "account",
  "balance"

  Returns:
  A new object with each unique brokerage as a key and that brokerage's
  corresponding accounts and balances and a value.
*****/
function formatAccountData(json) {
  /*****
    Summary:
    An object that will hold our account names and balances, organized
    by brokerage.

    Example:
    {
      "Scottrade": {"XXXX2222": 230012.23},
      "Etrade": {"XXXX2899": 1212.23, "XXXX1111": 11350.11}
      "Fidelity": {"XXXX1423": 12000.50, "XXXX5678": 2350.42}
    }

  *****/
  let accounts = {};

  // Loop through the provided JSON, get each of the properties.
  for (let i = 0, j = json.length; i < j; i++) {
    const name = json[i].brokerageName;
    const account = json[i].account;
    const balance = json[i].balance;

    // if we don't have that brokerage in our list, add it and the
    // account + balance
    if (!(name in accounts)) {
      accounts[name] = {};
      accounts[name][account] = balance;
    // otherwise we already have a key for that brokerage.
    // Add the account and balance to the existing brokerage
    } else {
      accounts[name][account] = balance;
    }
  }
  return accounts;
};

/*****
  Summary:
  Calculate the total for all accounts in each brokerage as well as the
  grand total for all accounts in all brokerages.

  Params:
  "accounts" -- This is our formatted object which must have keys corresponding
  to brokerage names and values corresponding to neted objects containing
  account names and balances.

  Returns:
  A new object with each unique brokerage as a key and that brokerage's
  total as a value. Also includes a key for the grand total and it's associated
  value.
*****/
function calculateTotals(accounts) {
  let accountTotals = {};
  let grandTotal = 0;

  for (let brokerage in accounts) {
    let brokerageTotal = 0;

    // Add the account balances for each account in each brokerage
    for (let accountNumber in accounts[brokerage]) {
      brokerageTotal += accounts[brokerage][accountNumber];
    }

    // Create a new key on our new object (the brokerage name) and assign
    // a value of the total for that brokerage
    accountTotals[brokerage] = brokerageTotal;
  }

  // Calculate the grand total of all accounts in all brokerages and add
  // that as a property on our new object.
  for (let brokerage in accountTotals) {
    grandTotal += accountTotals[brokerage];
  }

  accountTotals.total = grandTotal;

  return accountTotals;
}

/*****
  Summary:
  Display all of our data in the console

  Params:
  "accounts" -- This is our formatted object which must have keys corresponding
  to brokerage names and values corresponding to nested objects containing
  account names and balances.

  "totals" -- This is the object that contains the name and total amount for
  each brokerage as well as the grand total

  Returns:
  Nothing.
*****/
function printAccountData(accounts, totals) {
  const accountTotal = Math.round(totals.total * 100) / 100;

  // The grand total
  console.log("Account Total : " + accountTotal.toFixed(2));
  for (let brokerage in accounts) {
    // The total for each brokerage
    console.log(brokerage + " : " + totals[brokerage].toFixed(2));
    for (let accountNumber in accounts[brokerage]) {
      // The total for each account in each brokerage
      console.log(accountNumber + " : " + accounts[brokerage][accountNumber].toFixed(2));
    }
  }
}

/*****
  Summary:
  Get our JSON payload.

  Params:
  "url" -- The request URL that we expect will return JSON

  "callback" -- A function to process the response

  Returns:
  Nothing.
*****/
function getJSON(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open("get", url);
  xhr.responseType = "json";
  xhr.onload = () => {
    if (xhr.status == 200) {
      callback(null, xhr.response);
    } else {
      callback(status);
    }
  };
  xhr.send();
};

// Make the request and log our data if it's available. If not, log the error
getJSON("../accounts.json", (err, data) => {
  if (err != null) {
    console.log(err); // cheesy error-handling
  } else {
    const accountData = formatAccountData(data)
    const totals = calculateTotals(accountData);
    printAccountData(accountData, totals);
  }
})

// Note that this will show the grand total as $256925.49. The sample data
// returns a grand total of $255713.26. The difference is 1212.24, the balance
// on the second Etrade account. I'm thinking this was an error in the sample data
// but I would want to verify.
