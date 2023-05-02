import mongoose from "mongoose";
import { ColumnDocument } from "../models/documents/ColumnDocument";

const createNewEmptyColumns = (columnNames: string[]) => {
  if (!columnNames || (columnNames && columnNames.length == 0)) {
    throw Error(
      "Cannot create new Columns when there are no column names provided!"
    );
  }
  const columnsArray: ColumnDocument[] = columnNames.map((colName) => {
    const newCol = {
      id: new mongoose.Types.ObjectId(),
      name: colName,
      tasks: [],
    };
    return newCol;
  });
  return columnsArray;
};

const columnsService = {
  createNewEmptyColumns,
};

export default columnsService;
