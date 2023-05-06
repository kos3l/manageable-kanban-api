import mongoose from "mongoose";
import { ColumnDocument } from "../models/documents/ColumnDocument";

const createNewEmptyColumns = (columnNames: string[]) => {
  if (!columnNames || (columnNames && columnNames.length == 0)) {
    throw Error(
      "Cannot create new Columns when there are no column names provided!"
    );
  }
  const columnsArray: ColumnDocument[] = columnNames.map((colName, index) => {
    const newCol = {
      _id: new mongoose.Types.ObjectId(),
      name: colName,
      tasks: [],
      order: index,
    };
    return newCol;
  });
  return columnsArray;
};

const createNewColumn = (columnName: string, order: number) => {
  if (!columnName || order == undefined || order == null) {
    throw Error(
      "Cannot create new Columns when there are no column names provided!"
    );
  }
  const columnsArray: ColumnDocument = {
    _id: new mongoose.Types.ObjectId(),
    name: columnName,
    tasks: [],
    order: order,
  };
  return columnsArray;
};

const columnsService = {
  createNewEmptyColumns,
  createNewColumn,
};

export default columnsService;
