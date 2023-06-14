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
import { Dropdown } from "primereact/dropdown";

export class Branch extends Component {
  static displayName = Branch.name;

  constructor(props) {
    super(props);
    this.dt = React.createRef();
    this.toast = React.createRef();
    this.emptybranch = {
      id: null,
      bankCode: "",
      description: "",
      deleted: false,
    };
    this.state = {
      branches: [],
      banks: [],
      filters: null,
      branchNew: false,
      globalFilterValue: "",
      loading: true,
      deleteBranchDialog: false,
      branchDialog: false,
      submitted: false,
      branch: this.emptybranch,
      currentPage: 0,
      rowPerPage: 10,
    };
  }

  initFilters = () => {
    this.setState({
      filters: {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        id: { value: null, matchMode: FilterMatchMode.EQUALS },
        bankCode: { value: null, matchMode: FilterMatchMode.EQUALS },
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
      branch: this.emptybranch,
      submitted: false,
      branchDialog: true,
      branchNew: true,
    });
  };

  hideDialog = () => {
    this.setState({
      submitted: false,
      branchDialog: false,
    });
  };

  hideDeleteBranchDialog = () => {
    this.setState({
      deletebranchDialog: false,
    });
  };

  editbranch = async (branch) => {
    const branchId = branch.id;

    const response = await fetch(`api/BranchModels/${branchId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Branch not found");
      } else {
        throw new Error("Failed to retrieve branch");
      }
    }
    const data = await response.json();
    this.setState({
      branch: data,
      branchDialog: true,
      branchNew: false,
    });
  };
  confirmDeleteBranch = (branch) => {
    this.setState({
      branch: branch,
      deletebranchDialog: true,
    });
  };

  deleteBranch = async () => {
    const response = await fetch(`api/BranchModels/${this.state.branch.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      this.setState({
        branch: this.emptybranch,
        deletebranchDialog: false,
      });
      this.toast.current.show({
        severity: "success",
        summary: "Successful",
        detail: "Branch Deleted",
        life: 3000,
      });
    }
  };

  saveBranch = async () => {
    this.setState({
      submitted: true,
    });

    if (this.state.branchNew == false) {
      // Send the PATCH request with the changed properties
      const response = await fetch(`api/BranchModels/${this.state.branch.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.state.branch),
      });

      if (response.ok) {
        this.setState({
          branchDialog: false,
          branch: this.emptybranch,
        });

        this.toast.current.show({
          severity: "success",
          summary: "Successful",
          detail: "Branch Updated",
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
      const response = await fetch("api/BranchModels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: this.state.branch.code,
          description: this.state.branch.description,
          deleted: this.state.branch.deleted,
        }),
      });

      if (response.ok) {
        this.setState({
          branchDialog: false,
          branch: this.emptybranch,
          branchNew: false,
        });
        this.toast.current.show({
          severity: "success",
          summary: "Successful",
          detail: "Branch Created",
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
    let _branch = { ...this.state.branch };

    _branch[`${name}`] = val;
    this.setState({
      branch: _branch,
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

  branchDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={this.hideDialog}
      />
      <Button label="Save" icon="pi pi-check" onClick={this.savebranch} />
    </React.Fragment>
  );

  deletebranchDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={this.hideDeleteBranchDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={() => {
          this.deleteBranch();
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
          onClick={() => this.editbranch(rowData)}
        />
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={() => this.confirmDeletebranch(rowData)}
        />
      </React.Fragment>
    );
  };

  populatebranches = async () => {
    const branchResponse = await fetch("api/BranchModels");

    if (branchResponse.ok) {
      const data = await branchResponse.json();
      this.setState({
        branches: data,
      });
    }
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
    this.populatebranches();
    this.populateBanks();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (
      this.state.branch.bankCode !== prevState.branch.bankCode ||
      this.state.branch.bankCode !== prevState.branch.bankCode ||
      this.state.branch.description !== prevState.branch.description ||
      this.state.branch.description !== prevState.branch.description
    ) {
      this.populatebranches();
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
          value={this.state.branches}
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
          globalFilterFields={["id", "code", "description"]}
          header={this.renderHeader}
          emptyMessage="No branch found."
          selectionMode={null}
          exportFilename="TechnicalExam"
        >
          <Column field="id" header="#" />
          <Column field="bankCode" header="Bank Code" />
          <Column field="description" header="Branch Name" />
          <Column
            header="Action"
            body={this.actionBodyTemplate}
            exportable={false}
            className="w-2"
          />
        </DataTable>

        <Dialog
          visible={this.state.branchDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="Branch Details"
          modal
          className="p-fluid"
          footer={this.branchDialogFooter}
          onHide={this.hideDialog}
        >
          <div className="field">
            <label htmlFor="bankCode" className="font-bold">
              Bank's Code
            </label>

            <Dropdown
              id="bankCode"
              name="bankCode"
              value={this.state.branch.bankCode}
              onChange={(e) => this.onInputChange(e, "bankcode")}
              options={this.state.banks}
              placeholder="Select a Bank"
              optionLabel="description"
              optionValue="code"
              panelClassName="custom-dropdown"
              className={classNames({
                "p-invalid":
                  this.state.submitted && !this.state.branch.bankCode,
              })}
            />
            {this.state.submitted && !this.state.branch.bankCode && (
              <small className="p-error">Bank's Code is required.</small>
            )}
          </div>

          <div className="field">
            <label htmlFor="branchDesc" className="font-bold">
              Branch Name
            </label>
            <InputText
              id="branchDesc"
              name="branchDesc"
              value={this.state.branch.description}
              onChange={(e) => this.onInputChange(e, "description")}
              required
              placeholder="branch Name"
              className={classNames({
                "p-invalid":
                  this.state.submitted && !this.state.branch.description,
              })}
            />
            {this.state.submitted && !this.state.branch.description && (
              <small className="p-error">Branch name is required.</small>
            )}
          </div>
        </Dialog>

        <Dialog
          visible={this.state.deleteBranchDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="Confirm"
          modal
          footer={this.deletebranchDialogFooter}
          onHide={this.hideDeletebranchDialog}
        >
          <div className="confirmation-content">
            <i
              className="pi pi-exclamation-triangle mr-3"
              style={{ fontSize: "2rem" }}
            />
            {this.state.branch && (
              <span>
                Are you sure you want to delete{" "}
                <b>{this.state.branch.description}</b>?
              </span>
            )}
          </div>
        </Dialog>
      </div>
    );
  }
}
