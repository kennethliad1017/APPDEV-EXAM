import React, { Component } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Dialog } from "primereact/dialog";
import { classNames } from "primereact/utils";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";

import { formatDateString } from "../utils";

export class Bank extends Component {
  static displayName = Bank.name;

  constructor(props) {
    super(props);
    this.dt = React.createRef();
    this.toast = React.createRef();
    this.emptyBank = {
      id: null,
      code: "",
      description: "",
      deleted: false,
    };
    this.state = {
      banks: [],
      filters: null,
      bankNew: false,
      globalFilterValue: "",
      loading: true,
      deleteBankDialog: false,
      bankDialog: false,
      branchDialog: false,
      submitted: false,
      bank: this.emptyBank,
      currentPage: 0,
      rowPerPage: 10,
    };
  }

  initFilters = () => {
    this.setState({
      filters: {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        id: { value: null, matchMode: FilterMatchMode.EQUALS },
        code: { value: null, matchMode: FilterMatchMode.EQUALS },
        description: {
          constraints: [
            { value: null, matchMode: FilterMatchMode.STARTS_WITH },
          ],
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
      account: this.emptyBank,
      submitted: false,
      bankDialog: true,
      bankNew: true,
    });
  };

  hideDialog = () => {
    this.setState({
      submitted: false,
      bankDialog: false,
    });
  };

  hideDeleteBankDialog = () => {
    this.setState({
      deleteBankDialog: false,
    });
  };

  editBank = async (bank) => {
    const bankId = bank.id;

    const response = await fetch(`api/BankModels/${bankId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Account not found");
      } else {
        throw new Error("Failed to retrieve account");
      }
    }
    const data = await response.json();
    this.setState({
      bank: data,
      bankDialog: true,
      bankNew: false,
    });
  };
  confirmDeleteBank = (bank) => {
    this.setState({
      bank: bank,
      deleteBankDialog: true,
    });
  };

  deleteBank = async () => {
    const response = await fetch(`api/BankModels/${this.state.bank.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      this.setState({
        bank: this.emptyBank,
        deleteBankDialog: false,
      });
      this.toast.current.show({
        severity: "success",
        summary: "Successful",
        detail: "Account Deleted",
        life: 3000,
      });
    }
  };

  saveBank = async () => {
    this.setState({
      submitted: true,
    });

    if (this.state.bankNew == false) {
      // Send the PATCH request with the changed properties
      const response = await fetch(`api/BankModels/${this.state.bank.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.state.bank),
      });

      if (response.ok) {
        this.setState({
          bankDialog: false,
          bank: this.emptyBank,
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
      const response = await fetch("api/BankModels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: this.state.bank.code,
          description: this.state.bank.description,
          deleted: this.state.bank.deleted,
        }),
      });

      if (response.ok) {
        this.setState({
          bankDialog: false,
          bank: this.emptyBank,
          bankNew: false,
        });
        this.toast.current.show({
          severity: "success",
          summary: "Successful",
          detail: "Bank Created",
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
    let _bank = { ...this.state.bank };

    _bank[`${name}`] = val;
    this.setState({
      bank: _bank,
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

  bankDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={this.hideDialog}
      />
      <Button label="Save" icon="pi pi-check" onClick={this.saveBank} />
    </React.Fragment>
  );

  deleteBankDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={this.hideDeleteBankDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={() => {
          this.deleteBank();
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
          onClick={() => this.editBank(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => this.confirmDeleteBank(rowData)}
        />
      </React.Fragment>
    );
  };

  populateBanks = async () => {
    const bankAccountResponse = await fetch("api/BankModels");

    if (bankAccountResponse.ok) {
      const data = await bankAccountResponse.json();
      this.setState({
        banks: data,
      });
    }
  };

  componentDidMount() {
    this.setState({ loading: false });
    this.initFilters();
    this.populateBanks();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (
      this.state.banks.code !== prevState.banks.code ||
      this.state.banks.code !== prevState.banks.code ||
      this.state.bank.description !== prevState.banks.description ||
      this.state.bank.description !== prevState.bank.description
    ) {
      const bankAccountResponse = await fetch("api/BankModels");

      if (bankAccountResponse.ok) {
        const data = await bankAccountResponse.json();
        this.setState({
          banks: data,
        });
      }
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
          value={this.state.banks}
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
          tableStyle={{ minWidth: "50rem" }}
          filters={this.state.filters}
          dataKey="id"
          loading={this.state.loading}
          globalFilterFields={["id", "code", "description"]}
          header={this.renderHeader}
          emptyMessage="No account found."
          selectionMode={null}
          exportFilename="TechnicalExam"
        >
          <Column field="id" header="#" />
          <Column field="code" header="Bank Code" />
          <Column field="description" header="Bank Name" />
          <Column
            header="Action"
            body={this.actionBodyTemplate}
            exportable={false}
            className="w-2"
          />
        </DataTable>

        <Dialog
          visible={this.state.bankDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="Account Details"
          modal
          className="p-fluid"
          footer={this.bankDialogFooter}
          onHide={this.hideDialog}
        >
          <div className="field">
            <label htmlFor="bankCode" className="font-bold">
              Bank's code
            </label>
            <InputText
              id="bankCode"
              name="bankCode"
              value={this.state.bank.code}
              onChange={(e) => this.onInputChange(e, "code")}
              required
              autoFocus
              placeholder="Bank Code"
              className={classNames({
                "p-invalid": this.state.submitted && !this.state.bank.code,
              })}
            />
            {this.state.submitted && !this.state.bank.code && (
              <small className="p-error">Bank Code is required.</small>
            )}
          </div>

          <div className="field">
            <label htmlFor="bankDesc" className="font-bold">
              Bank Name
            </label>
            <InputText
              id="bankDesc"
              name="bankDesc"
              value={this.state.bank.description}
              onChange={(e) => this.onInputChange(e, "description")}
              required
              placeholder="Bank Name"
              className={classNames({
                "p-invalid":
                  this.state.submitted && !this.state.bank.description,
              })}
            />
            {this.state.submitted && !this.state.bank.description && (
              <small className="p-error">Bank name is required.</small>
            )}
          </div>
        </Dialog>

        <Dialog
          visible={this.state.deleteBankDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="Confirm"
          modal
          footer={this.deleteBankDialogFooter}
          onHide={this.hideDeleteBankDialog}
        >
          <div className="confirmation-content">
            <i
              className="pi pi-exclamation-triangle mr-3"
              style={{ fontSize: "2rem" }}
            />
            {this.state.bank && (
              <span>
                Are you sure you want to delete{" "}
                <b>{this.state.bank.description}</b>?
              </span>
            )}
          </div>
        </Dialog>
      </div>
    );
  }
}
