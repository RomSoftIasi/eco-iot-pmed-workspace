const { DataSource } = WebCardinal.dataSources;

class TableDataSource extends DataSource {
    constructor(data) {
        super();
        this.model.tableData = data;
    }

    setNumberOfColumns(noOfColumns) {
        return this.model.noOfColumns = noOfColumns;
    }

    setDataSourcePageSize(pageSize) {
        this.model.elements = pageSize;
        this.setPageSize(this.model.elements);
    }

    async getPageDataAsync(startOffset, dataLengthForCurrentPage) {
        if (this.model.tableData.length <= dataLengthForCurrentPage) {
            this.setPageSize(this.model.tableData.length);
        }
        else {
            this.setPageSize(this.model.elements);
        }
        let slicedData = [];
        this.setRecordsNumber(this.model.tableData.length);
        if (dataLengthForCurrentPage > 0) {
            slicedData = Object.entries(this.model.tableData).slice(startOffset, startOffset + dataLengthForCurrentPage).map(entry => entry[1]);
        } else {
            slicedData = Object.entries(this.model.tableData).slice(0, startOffset - dataLengthForCurrentPage).map(entry => entry[1]);
        }
        return slicedData;
    }
}

class DataSourceFactory {

    static createDataSource(noOfColumns,itemsPerPage, data) { 
        const tableDataSource = new TableDataSource(data);

        tableDataSource.updateTable = function (newData) {
            this.model.tableData = newData;
            this.getElement().dataSize = newData.length;
            this.forceUpdate(true);
        }

        tableDataSource.setDataSourcePageSize(itemsPerPage);
        tableDataSource.setNumberOfColumns(noOfColumns);
        return tableDataSource;
    }
}

module.exports = DataSourceFactory
