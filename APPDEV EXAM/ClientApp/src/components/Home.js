import React, { Component } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { classNames } from "primereact/utils";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";

import {
  formatDateString,
  parseFormattedDate,
  parseNumberString,
} from "../utils";

export class Home extends Component {
  static displayName = Home.name;

  constructor(props) {
    super(props);
    this.dt = React.createRef();
    this.toast = React.createRef();
    this.emptyAccount = {
      id: null,
      bankName: "",
      branchName: "",
      openDate: "",
      birthdate: "",
      accountNo: "",
      firstName: "",
      middleName: "",
      lastName: "",
      balance: 0,
    };
    this.state = {
      bankAccounts: [],
      bankNames: [],
      branchNames: [],
      filters: null,
      accountNew: false,

      globalFilterValue: "",
      loading: true,
      deleteAccountDialog: false,
      deleteAccountsDialog: false,
      accountDialog: false,
      submitted: false,
      account: this.emptyAccount,
      currentPage: 0,
      rowPerPage: 10,
    };
  }

  initFilters = () => {
    this.setState({
      filters: {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        bankName: {
          constraints: [
            { value: null, matchMode: FilterMatchMode.STARTS_WITH },
          ],
        },
        branchName: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        openDate: { value: null, matchMode: FilterMatchMode.EQUALS },
        accountNo: {
          constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
        fullName: {
          constraints: [
            { value: null, matchMode: FilterMatchMode.STARTS_WITH },
          ],
        },
        balance: {
          constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
      },
    });
    this.setState({
      globalFilterValue: "",
    });
  };

  clearFilter = () => {
    this.initFilters();
  };

  onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...this.state.filters };

    _filters["global"].value = value;

    this.setState({
      filters: _filters,
      globalFilterValue: value,
    });
  };

  renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          outlined
          onClick={this.clearFilter}
        />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={this.state.globalFilterValue}
            onChange={this.onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </span>
      </div>
    );
  };

  openNew = () => {
    this.setState({
      account: this.emptyAccount,
      submitted: false,
      accountDialog: true,
      accountNew: true,
    });
  };

  hideDialog = () => {
    this.setState({
      submitted: false,
      accountDialog: false,
    });
  };

  hideDeleteAccountDialog = () => {
    this.setState({
      deleteAccountDialog: false,
    });
  };

  hideDeleteAccountsDialog = () => {
    this.setState({
      deleteAccountsDialog: false,
    });
  };

  editAccount = async (account) => {
    const accountId = account.id;

    const response = await fetch(`api/BankAccounts/${accountId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Account not found");
      } else {
        throw new Error("Failed to retrieve account");
      }
    }
    const data = await response.json();
    this.setState({
      account: {
        ...data,
        bankName: data.branchCode,
        branchName: data.branchCode,
      },
      accountDialog: true,
      accountNew: false,
    });
  };
  confirmDeleteAccount = (account) => {
    this.setState({
      account: account,
      deleteAccountDialog: true,
    });
  };

  deleteAccount = async () => {
    const response = await fetch(`api/BankAccounts/${this.state.account.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      this.setState({
        account: this.emptyAccount,
        deleteAccountDialog: false,
      });
      this.toast.current.show({
        severity: "success",
        summary: "Successful",
        detail: "Account Deleted",
        life: 3000,
      });
    }
  };

  saveAccount = async () => {
    this.setState({
      submitted: true,
    });

    if (this.state.accountNew == false) {
      // Send the PATCH request with the changed properties
      const response = await fetch(
        `api/BankAccounts/${this.state.account.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.state.account),
        }
      );

      if (response.ok) {
        this.setState({
          accountDialog: false,
          account: this.emptyAccount,
        });

        this.toast.current.show({
          severity: "success",
          summary: "Successful",
          detail: "Account Updated",
          life: 3000,
        });
      } else {
        this.toast.current.show({
          severity: "failed",
          summary: "Failed",
          detail: "Failed to update, Something went wrong!",
          life: 3000,
        });
      }
    } else {
      const birthdate = new Date(this.state.account.birthdate);
      const birthdateOffset = birthdate.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
      const adjustedBirthdate = new Date(birthdate.getTime() - birthdateOffset);

      const openDate = new Date(this.state.account.openDate);
      const openDateOffset = birthdate.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
      const adjustedOpenDate = new Date(openDate.getTime() - openDateOffset);

      const response = await fetch("api/BankAccounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: this.state.account.firstName,
          middleName: this.state.account.middleName,
          lastName: this.state.account.lastName,
          accountNo: this.state.account.accountNo,
          branchCode: this.state.account.branchName,
          birthDate: adjustedBirthdate.toISOString(),
          openDate: adjustedOpenDate.toISOString(),
          balance: this.state.account.balance,
          branches: this.state.branchNames[0],
        }),
      });

      if (response.ok) {
        this.setState({
          accountDialog: false,
          account: this.emptyAccount,
          accountNew: false,
        });
        this.toast.current.show({
          severity: "success",
          summary: "Successful",
          detail: "Account Created",
          life: 3000,
        });
      } else {
        this.toast.current.show({
          severity: "failed",
          summary: "Failed",
          detail: "Something went wrong!",
          life: 3000,
        });
      }
    }
  };

  onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || "";
    let _account = { ...this.state.account };

    _account[`${name}`] = val;
    this.setState({
      account: _account,
    });
  };

  onInputNumberChange = (e, name) => {
    const val = e.value || 0;
    let _account = { ...this.state.account };

    _account[`${name}`] = val;

    this.setState({
      account: _account,
    });
  };

  exportCSV = () => {
    this.dt.current.exportCSV();
  };

  leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="New"
          icon="pi pi-plus"
          severity="success"
          onClick={this.openNew}
        />
      </div>
    );
  };

  rightToolbarTemplate = () => {
    return (
      <Button
        label="Export"
        icon="pi pi-upload"
        className="p-button-help"
        onClick={this.exportCSV}
      />
    );
  };

  accountDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={this.hideDialog}
      />
      <Button label="Save" icon="pi pi-check" onClick={this.saveAccount} />
    </React.Fragment>
  );

  deleteAccountDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={this.hideDeleteAccountDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={() => {
          this.deleteAccount();
        }}
      />
    </React.Fragment>
  );

  actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          className="mr-2"
          onClick={() => this.editAccount(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => this.confirmDeleteAccount(rowData)}
        />
      </React.Fragment>
    );
  };

  populateBank = async () => {
    const bankReponse = await fetch("api/BankAccounts/bank");

    if (bankReponse.ok) {
      const data = await bankReponse.json();
      this.setState({
        bankNames: data,
      });
    }
  };

  populateBranch = async () => {
    const branchReponse = await fetch("api/BankAccounts/branch");

    if (branchReponse.ok) {
      const data = await branchReponse.json();
      this.setState({
        branchNames: data,
      });
    }
  };

  populateBankAccounts = async () => {
    const bankAccountResponse = await fetch("api/BankAccounts");

    if (bankAccountResponse.ok) {
      const data = await bankAccountResponse.json();
      this.setState({
        bankAccounts: data,
      });
    }
  };

  componentDidMount() {
    this.setState({ loading: false });
    this.initFilters();
    this.populateBank();
    this.populateBranch();
    this.populateBankAccounts();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.state.account.bankName !== prevState.account.bankName) {
      this.populateBranch();
      const newBranches = this.state.branchNames.filter(
        (branch) => branch.bankCode == this.state.account.bankName
      );

      this.setState({
        branchNames: newBranches,
      });
    }

    if (
      this.state.account.bankName !== prevState.account.bankName ||
      this.state.account.branchName !== prevState.account.branchName
    ) {
      this.populateBankAccounts();
    }
  }

  render() {
    return (
      <div className="p-container">
        <Toast ref={this.toast} />
        <Toolbar
          className="mb-4"
          start={this.leftToolbarTemplate}
          end={this.rightToolbarTemplate}
        ></Toolbar>
        <DataTable
          ref={this.dt}
          value={this.state.bankAccounts}
          paginator
          rows={this.state.rowPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          first={this.state.currentPage}
          onPage={(event) => {
            this.setState({
              currentPage: event.first,
              rowPerPage: event.rows,
            });
          }}
          paginatorDropdownAppendTo="self"
          tableStyle={{ minWidth: "50rem" }}
          filters={this.state.filters}
          dataKey="id"
          loading={this.state.loading}
          globalFilterFields={[
            "id",
            "bankName",
            "branchName",
            "dateOpen",
            "accountNo",
            "fullName",
            "balance",
          ]}
          header={this.renderHeader}
          emptyMessage="No account found."
          selectionMode={null}
          exportFilename="TechnicalExam"
        >
          <Column field="id" header="#" />
          <Column field="bankName" header="Bank Name" />
          <Column field="branchName" header="Branch Name" />
          <Column field="dateOpen" header="Date Open" className="w-2" />
          <Column field="accountNo" header="Account Number" />
          <Column
            field="fullName"
            header="Full Name(Last Name, First Name, Middle Name)"
          />
          <Column field="balance" header="Balance" />
          <Column
            header="Action"
            body={this.actionBodyTemplate}
            exportable={false}
            className="w-2"
          />
        </DataTable>

        <Dialog
          visible={this.state.accountDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="Account Details"
          modal
          className="p-fluid"
          footer={this.accountDialogFooter}
          onHide={this.hideDialog}
        >
          <div className="field">
            <label htmlFor="fname" className="font-bold">
              First Name
            </label>
            <InputText
              id="fname"
              name="fname"
              value={this.state.account.firstName}
              onChange={(e) => this.onInputChange(e, "firstName")}
              required
              autoFocus
              placeholder="Firstname"
              className={classNames({
                "p-invalid":
                  this.state.submitted && !this.state.account.firstName,
              })}
            />
            {this.state.submitted && !this.state.account.firstName && (
              <small className="p-error">First name is required.</small>
            )}
          </div>
          <div className="field">
            <label htmlFor="mname" className="font-bold">
              Middle Name
            </label>
            <InputText
              id="mname"
              name="mname"
              value={this.state.account.middleName}
              onChange={(e) => this.onInputChange(e, "middleName")}
              required
              placeholder="Middlename"
              className={classNames({
                "p-invalid":
                  this.state.submitted && !this.state.account.middleName,
              })}
            />
            {this.state.submitted && !this.state.account.middleName && (
              <small className="p-error">Middle name is required.</small>
            )}
          </div>

          <div className="field">
            <label htmlFor="lname" className="font-bold">
              Last Name
            </label>
            <InputText
              id="lname"
              name="lname"
              value={this.state.account.lastName}
              onChange={(e) => this.onInputChange(e, "lastName")}
              required
              placeholder="Lastname"
              className={classNames({
                "p-invalid":
                  this.state.submitted && !this.state.account.lastName,
              })}
            />
            {this.state.submitted && !this.state.account.lastName && (
              <small className="p-error">Last name is required.</small>
            )}
          </div>
          <div className="field">
            <label htmlFor="accountNo" className="font-bold">
              Account Number
            </label>
            <InputText
              id="accountNo"
              name="accountNo"
              value={this.state.account.accountNo}
              onChange={(e) => this.onInputChange(e, "accountNo")}
              required
            />
          </div>

          <div className="formgrid grid">
            <div className="field col">
              <label htmlFor="bankName" className="mb-3 font-bold">
                Bank Name
              </label>
              <Dropdown
                id="bankName"
                name="bankName"
                value={this.state.account.bankName}
                onChange={(e) => this.onInputChange(e, "bankName")}
                options={this.state.bankNames}
                placeholder="Select a Bank"
                optionLabel="description"
                optionValue="code"
                panelClassName="custom-dropdown"
                className="md:w-full sm:w-14rem"
              />
            </div>
            <div className="field col">
              <label htmlFor="branchName" className="mb-3 font-bold">
                Branch Name
              </label>
              <Dropdown
                id="branchName"
                name="branchName"
                value={this.state.account.branchName}
                onChange={(e) => this.onInputChange(e, "branchName")}
                options={this.state.branchNames}
                placeholder="Select a Branch"
                optionLabel="description"
                optionValue="bankCode"
                panelClassName="custom-dropdown"
                className="md:w-full sm:w-14rem"
                disabled={this.state.account.bankName === ""}
                required
              />
            </div>
          </div>

          {this.state.accountNew && (
            <div className="field">
              <label htmlFor="birthdate" className="mb-3 font-bold">
                Birthdate
              </label>
              <Calendar
                id="birthdate"
                name="birthdate"
                value={
                  new Date(
                    parseFormattedDate(
                      this.state.account.birthdate || Date.now()
                    )
                  )
                }
                onChange={(e) => this.onInputChange(e, "birthdate")}
                dateFormat="mm/dd/yy"
                disabled={
                  this.state.account != this.emptyAccount &&
                  !this.state.accountNew
                }
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="dateOpen" className="mb-3 font-bold">
              Date Open
            </label>
            <Calendar
              id="dateOpen"
              name="dateOpen"
              value={
                new Date(
                  parseFormattedDate(this.state.account.openDate || Date.now())
                )
              }
              onChange={(e) => {
                console.log(e.value);
                this.onInputChange(e, "openDate");
              }}
              dateFormat="mm/dd/yy"
              disabled={
                this.state.account != this.emptyAccount &&
                !this.state.accountNew
              }
            />
          </div>

          <div className="field">
            <label htmlFor="accountBalance" className="font-bold">
              Balance
            </label>
            <InputNumber
              id="accountBalance"
              name="accountBalance"
              value={parseNumberString(this.state.account.balance)}
              onValueChange={(e) => this.onInputChange(e, "balance")}
              useGrouping={false}
              minFractionDigits={2}
              disabled={
                this.state.account != this.emptyAccount &&
                !this.state.accountNew
              }
            />
          </div>
        </Dialog>

        <Dialog
          visible={this.state.deleteAccountDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="Confirm"
          modal
          footer={this.deleteAccountDialogFooter}
          onHide={this.hideDeleteAccountDialog}
        >
          <div className="confirmation-content">
            <i
              className="pi pi-exclamation-triangle mr-3"
              style={{ fontSize: "2rem" }}
            />
            {this.state.account && (
              <span>
                Are you sure you want to delete{" "}
                <b>{this.state.account.fullName}</b>?
              </span>
            )}
          </div>
        </Dialog>

        <Dialog
          visible={this.state.deleteAccountsDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="Confirm"
          modal
          footer={this.deleteAccountsDialogFooter}
          onHide={this.hideDeleteAccountDialog}
        >
          <div className="confirmation-content">
            <i
              className="pi pi-exclamation-triangle mr-3"
              style={{ fontSize: "2rem" }}
            />
            {this.state.account && (
              <span>
                Are you sure you want to delete the selected accounts?
              </span>
            )}
          </div>
        </Dialog>
      </div>
    );
  }
}
